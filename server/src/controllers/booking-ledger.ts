import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import BookingLedger, {
  IBookingLedger,
  PaymentMethod,
  PaymentType,
} from "../models/booking-ledger";
import ClientBooking from "../models/clientBooking";
import createError from "../utils/createError";

export class BookingLedgerController {
  /**
   * Create a new payment entry in the booking ledger
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentData: Partial<IBookingLedger> = req.body;

      // Validate required fields
      if (!paymentData.clientId) {
        return next(createError(400, "Client ID is required"));
      }

      if (!paymentData.amount || paymentData.amount <= 0) {
        return next(createError(400, "Valid amount is required"));
      }

      if (typeof paymentData.demand != "number" || paymentData.demand < 0) {
        return next(createError(400, "Valid demand is required"));
      }

      if (!paymentData.method) {
        return next(createError(400, "Payment method is required"));
      }

      if (!paymentData.type) {
        return next(createError(400, "Payment type is required"));
      }

      if (!paymentData.toAccount) {
        return next(createError(400, "Destination account is required"));
      }

      if (!paymentData.description) {
        return next(createError(400, "Description is required"));
      }

      // Verify client exists
      const clientBooking = await ClientBooking.findById(paymentData.clientId);
      if (!clientBooking) {
        return next(createError(404, "Client booking not found"));
      }

      // Generate unique transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create the payment entry
      const newPayment = new BookingLedger({
        ...paymentData,
        transactionId,
        date: paymentData.date || new Date(),
        createdBy: paymentData.createdBy || "system",
        paymentDetails: paymentData.paymentDetails || {},
      });

      const savedPayment = await newPayment.save();

      // Add payment ID to client booking's payments array
      await ClientBooking.findByIdAndUpdate(
        paymentData.clientId,
        {
          $push: { payments: savedPayment._id },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      res.status(201).json({
        success: true,
        data: savedPayment,
      });
    } catch (error) {
      next(
        createError(
          400,
          error instanceof Error ? error.message : "Error creating payment",
        ),
      );
    }
  }

  /**
   * Get all payments by client with pagination and filtering
   */
  async getAllByClient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { clientId } = req.params;
      const {
        page = 1,
        limit = 10,
        fromDate,
        toDate,
        type,
        method,
        includeDeleted = false,
      } = req.query;

      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return next(createError(400, "Invalid client ID format"));
      }

      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      // Build filter object
      const filter: any = {
        clientId: new mongoose.Types.ObjectId(clientId),
      };

      // Include deleted records filter
      if (includeDeleted !== "true") {
        filter.isDeleted = false;
      }

      // Date range filter
      if (fromDate || toDate) {
        filter.date = {};
        if (fromDate) {
          const fromDateObj = new Date(fromDate as string);
          fromDateObj.setHours(0, 0, 0, 0);
          filter.date.$gte = fromDateObj;
        }
        if (toDate) {
          const toDateObj = new Date(toDate as string);
          toDateObj.setHours(23, 59, 59, 999);
          filter.date.$lte = toDateObj;
        }
      }

      // Payment type filter
      if (type && Object.values(PaymentType).includes(type as PaymentType)) {
        filter.type = type;
      }

      // Payment method filter
      if (
        method &&
        Object.values(PaymentMethod).includes(method as PaymentMethod)
      ) {
        filter.method = method;
      }

      // Fetch payments with pagination
      const payments = await BookingLedger.find(filter)
        .populate({
          path: "clientId",
          select: "applicant project unit phoneNo email",
          model: "ClientBooking",
        })
        .populate({
          path: "toAccount",
          select: "holderName name branch accountNumber",
        })
        .skip(skip)
        .limit(limitNumber)
        .sort({ date: -1, createdAt: -1 });

      // Count total documents with the same filter
      const total = await BookingLedger.countDocuments(filter);

      const summaryFilter = {
        ...filter,
        isDeleted: false, // Always exclude deleted records from summary
      };

      // Calculate summary statistics
      const summaryPipeline = [
        { $match: summaryFilter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalPayments: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$type",
                      [
                        PaymentType.SCHEDULE_PAYMENT,
                        PaymentType.ADVANCE,
                        PaymentType.ADJUSTMENT,
                      ],
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            totalRefunds: {
              $sum: {
                $cond: [{ $eq: ["$type", PaymentType.REFUND] }, "$amount", 0],
              },
            },
            totalPenalties: {
              $sum: {
                $cond: [{ $eq: ["$type", PaymentType.PENALTY] }, "$amount", 0],
              },
            },
          },
        },
      ];

      const summaryResult = await BookingLedger.aggregate(summaryPipeline);
      const summary =
        summaryResult.length > 0
          ? summaryResult[0]
          : {
              totalAmount: 0,
              totalPayments: 0,
              totalRefunds: 0,
              totalPenalties: 0,
              currentBalance: 0,
            };

      res.status(200).json({
        success: true,
        total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber,
        summary,
        data: payments,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching payments",
        ),
      );
    }
  }

  /**
   * Soft delete a payment entry
   */
  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const deletedBy = req.body.deletedBy || "system"; // Should be set from auth middleware

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid payment ID format"));
      }

      const payment = await BookingLedger.findById(id);

      if (!payment) {
        return next(createError(404, "Payment not found"));
      }

      if (payment.isDeleted) {
        return next(createError(400, "Payment is already deleted"));
      }

      // Use the model's soft delete method
      await payment.softDelete(deletedBy, reason);

      res.status(200).json({
        success: true,
        message: "Payment deleted successfully",
        data: payment,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error deleting payment",
        ),
      );
    }
  }

  /**
   * Restore a soft deleted payment entry
   */
  async restore(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid payment ID format"));
      }

      const payment = await BookingLedger.findById(id);

      if (!payment) {
        return next(createError(404, "Payment not found"));
      }

      if (!payment.isDeleted) {
        return next(createError(400, "Payment is not deleted"));
      }

      // Use the model's restore method
      await payment.restore();

      res.status(200).json({
        success: true,
        message: "Payment restored successfully",
        data: payment,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error restoring payment",
        ),
      );
    }
  }
}

export default new BookingLedgerController();

import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import ClientBooking, { ClientBookingType } from "../models/clientBooking";
import { Unit } from "../models/inventory";
import createError from "../utils/createError";

export class ClientBookingController {
  /**
   * Create a new client booking
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingData: ClientBookingType = req.body;

      // First, validate the unit ID exists
      if (!bookingData.unit) {
        return next(createError(400, "Unit ID is required"));
      }

      // Check if the unit exists
      const unit = await Unit.findById(bookingData.unit);
      if (!unit) {
        return next(createError(404, "Unit not found"));
      }

      // Create the booking
      const newBooking = new ClientBooking(bookingData);
      const savedBooking = await newBooking.save();

      // Update the unit with the booking's reference
      unit.status = "booked";
      unit.reservedByOrReason = savedBooking.applicant;
      unit.referenceId = savedBooking._id;
      await unit.save();

      res.status(201).json({
        success: true,
        data: savedBooking,
      });
    } catch (error) {
      next(
        createError(
          400,
          error instanceof Error ? error.message : "An unknown error occurred",
        ),
      );
    }
  }

  /**
   * Get all client bookings with pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // First, fetch all bookings
      const bookings = await ClientBooking.find()
        .populate("unit", "unitNumber area configuration") // Customize based on Unit model fields
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 });

      // Then, conditionally populate clientPartner only if it's an ObjectId
      const populatedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const bookingObj = booking.toObject();

          // Only attempt to populate if the clientPartner is a valid ObjectId
          if (
            booking.clientPartner &&
            mongoose.Types.ObjectId.isValid(booking.clientPartner)
          ) {
            try {
              const populatedBooking = await ClientBooking.findById(booking._id)
                .populate("clientPartner", "name")
                .lean();
              return populatedBooking;
            } catch (err) {
              // If population fails, return the original booking
              return bookingObj;
            }
          }
          return bookingObj;
        }),
      );

      const total = await ClientBooking.countDocuments();

      res.status(200).json({
        success: true,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limitNumber: limit,
        data: populatedBookings,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching bookings",
        ),
      );
    }
  }

  /**
   * Get a single client booking by ID
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid booking ID format"));
      }

      // First, find the booking without populating clientPartner
      const booking = await ClientBooking.findById(id).populate("unit");

      if (!booking) {
        return next(createError(404, "Booking not found"));
      }

      // Then, conditionally populate clientPartner if it's a valid ObjectId
      if (
        booking.clientPartner &&
        mongoose.Types.ObjectId.isValid(booking.clientPartner)
      ) {
        try {
          await booking.populate("clientPartner", "name");
        } catch (err) {
          // If population fails, continue with the original booking
          console.log("Failed to populate clientPartner:", err);
        }
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching booking",
        ),
      );
    }
  }

  /**
   * Update a client booking
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid booking ID format"));
      }

      // First update the booking without population
      const updatedBooking = await ClientBooking.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      ).populate("unit");

      if (!updatedBooking) {
        return next(createError(404, "Booking not found"));
      }

      // Then conditionally populate clientPartner if it's a valid ObjectId
      if (
        updatedBooking.clientPartner &&
        mongoose.Types.ObjectId.isValid(updatedBooking.clientPartner)
      ) {
        try {
          await updatedBooking.populate("clientPartner");
        } catch (err) {
          // If population fails, continue with the original booking
          console.log("Failed to populate clientPartner:", err);
        }
      }

      res.status(200).json({
        success: true,
        data: updatedBooking,
      });
    } catch (error) {
      next(
        createError(
          400,
          error instanceof Error ? error.message : "Error updating booking",
        ),
      );
    }
  }

  /**
   * Delete a client booking
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid booking ID format"));
      }

      const deletedBooking = await ClientBooking.findByIdAndDelete(id);

      if (!deletedBooking) {
        return next(createError(404, "Booking not found"));
      }

      res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error deleting booking",
        ),
      );
    }
  }
}

export default new ClientBookingController();

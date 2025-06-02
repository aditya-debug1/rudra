import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Bank } from "../models/bank-details";
import createError from "../utils/createError";

export class BankGetController {
  /**
   * Get all bank accounts with pagination and filtering
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Fetch bank accounts
      const bankAccounts = await Bank.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: bankAccounts,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Error fetching bank accounts",
        ),
      );
    }
  }

  /**
   * Get bank account by ID
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid bank account ID format"));
      }

      const bankAccount = await Bank.findById(id);

      if (!bankAccount) {
        return next(createError(404, "Bank account not found"));
      }

      res.status(200).json({
        success: true,
        data: bankAccount,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Error fetching bank account",
        ),
      );
    }
  }
}

export default new BankGetController();

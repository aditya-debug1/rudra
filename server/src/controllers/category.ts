import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import InventoryCategory from "../models/category";
import createError from "../utils/createError";

type PrecedenceItem = { id: string; precedence: number };

class InventoryCategoryController {
  /**
   * GET /categories
   * Returns all categories sorted by precedence (asc) then createdAt (desc)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await InventoryCategory.find().sort({
        precedence: 1,
        createdAt: -1,
      });
      res.status(200).json(categories);
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching categories",
        ),
      );
    }
  }

  /**
   * POST /categories
   * Body: { displayName, name, colorHex, precedence, type }
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = new InventoryCategory(req.body);
      await doc.save();

      res.status(201).json({
        message: "Category created successfully",
        categoryId: doc._id,
      });
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.name) {
        return next(
          createError(
            400,
            `Category name "${error.keyValue.name}" already exists`,
          ),
        );
      }

      next(
        createError(
          400,
          error instanceof Error ? error.message : "Error creating category",
        ),
      );
    }
  }

  /**
   * PUT /categories/:id
   * Body: partial InventoryCategory fields
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid category id"));
      }

      const updated = await InventoryCategory.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return next(createError(404, "Category not found"));
      }

      res.status(200).json(updated);
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.name) {
        return next(
          createError(
            400,
            `Category name "${error.keyValue.name}" already exists`,
          ),
        );
      }

      next(
        createError(
          400,
          error instanceof Error ? error.message : "Error updating category",
        ),
      );
    }
  }

  /**
   * DELETE /categories/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "Invalid category id"));
      }

      const deleted = await InventoryCategory.findByIdAndDelete(id);

      if (!deleted) {
        return next(createError(404, "Category not found"));
      }

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error deleting category",
        ),
      );
    }
  }

  /**
   * PATCH /categories/precedence
   * Body: { items: Array<{ id: string, precedence: number }> }
   * Updates precedence for the specified categories in bulk.
   */
  async setPrecedence(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body as { items: PrecedenceItem[] };

      if (!Array.isArray(items) || items.length === 0) {
        return next(createError(400, "items must be a non-empty array"));
      }

      // Basic validation
      for (const { id, precedence } of items) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return next(createError(400, `Invalid category id: ${id}`));
        }
        if (typeof precedence !== "number" || !Number.isFinite(precedence)) {
          return next(
            createError(400, `Invalid precedence for id ${id}: ${precedence}`),
          );
        }
      }

      // Build bulk operations
      const ops = items.map(({ id, precedence }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { precedence } },
        },
      }));

      const result = await InventoryCategory.bulkWrite(ops, {
        ordered: false,
      });

      // Optionally return updated docs for convenience
      const updatedIds = items.map((i) => i.id);
      const updatedDocs = await InventoryCategory.find({
        _id: { $in: updatedIds },
      }).sort({ precedence: 1 });

      res.status(200).json({
        message: "Precedence updated",
        matched: result.matchedCount,
        modified: result.modifiedCount,
        updated: updatedDocs,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error updating precedence",
        ),
      );
    }
  }
}

export default new InventoryCategoryController();

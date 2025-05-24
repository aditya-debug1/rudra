import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Floor, Unit, UnitType } from "../../models/inventory"; // Adjust path as needed
import createError from "../../utils/createError";

class UnitController {
  /**
   * Create a new unit
   */
  public async createUnit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        floorId,
        unitNumber,
        area,
        configuration,
        unitSpan,
        status,
        reservedByOrReason,
      } = req.body;

      // Validate required fields
      if (
        !floorId ||
        !unitNumber ||
        !area ||
        !configuration ||
        !unitSpan ||
        !status
      ) {
        next(createError(400, "Missing required fields"));
        return;
      }

      // Check if floor exists
      const floorExists = await Floor.findById(floorId);
      if (!floorExists) {
        next(createError(404, "Floor not found"));
        return;
      }

      // Check if unit number already exists in this floor
      const unitExists = await Unit.findOne({ floorId, unitNumber });
      if (unitExists) {
        next(
          createError(
            409,
            "Unit with this number already exists on this floor",
          ),
        );
        return;
      }

      // Create new unit
      const unit = new Unit({
        floorId,
        unitNumber,
        area,
        configuration,
        unitSpan,
        status,
        reservedByOrReason,
      });

      const savedUnit = await unit.save();

      // Add unit to floor
      await Floor.findByIdAndUpdate(floorId, {
        $push: { units: savedUnit._id },
      });

      res.status(201).json({
        success: true,
        data: savedUnit,
      });
    } catch (error) {
      console.error("Error creating unit:", error);
      next(createError(500, "Server error"));
    }
  }

  /**
   * Get all units with optional filtering
   */
  public async getAllUnits(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { floorId, status, configuration } = req.query;

      // Build query
      const query: any = {};
      if (floorId) query.floorId = floorId;
      if (status) query.status = status;
      if (configuration) query.configuration = configuration;

      const units = await Unit.find(query)
        .populate("floorId", "displayNumber type")
        .sort({ unitNumber: 1 });

      res.status(200).json({
        success: true,
        count: units.length,
        data: units,
      });
    } catch (error) {
      console.error("Error fetching units:", error);
      next(createError(500, "Server error"));
    }
  }

  /**
   * Get a single unit by ID
   */
  public async getUnitById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const unitId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(unitId)) {
        next(createError(400, "Invalid unit ID format"));
        return;
      }

      const unit = await Unit.findById(unitId).populate(
        "floorId",
        "displayNumber type wingId projectId",
      );

      if (!unit) {
        next(createError(404, "Unit not found"));
        return;
      }

      res.status(200).json({
        success: true,
        data: unit,
      });
    } catch (error) {
      console.error("Error fetching unit:", error);
      next(createError(500, "Server error"));
    }
  }

  /**
   * Update a unit
   */
  public async updateUnit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const unitId = req.params.id;
      const {
        unitNumber,
        area,
        configuration,
        unitSpan,
        status,
        reservedByOrReason,
        referenceId,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(unitId)) {
        next(createError(400, "Invalid unit ID format"));
        return;
      }

      // Find the unit first to ensure it exists
      const existingUnit = await Unit.findById(unitId);
      if (!existingUnit) {
        next(createError(404, "Unit not found"));
        return;
      }

      // Do not allow changing floorId or unitNumber to maintain data integrity
      if (req.body.floorId) {
        next(
          createError(400, "Cannot change floorId. Create a new unit instead."),
        );
        return;
      }

      const updatedUnit = await Unit.findByIdAndUpdate(
        unitId,
        {
          $set: {
            unitNumber:
              unitNumber !== undefined ? unitNumber : existingUnit.unitNumber,
            area: area !== undefined ? area : existingUnit.area,
            configuration: configuration || existingUnit.configuration,
            unitSpan: unitSpan !== undefined ? unitSpan : existingUnit.unitSpan,
            status: status || existingUnit.status,
            reservedByOrReason:
              reservedByOrReason || existingUnit.reservedByOrReason,
            referenceId: referenceId || existingUnit.referenceId,
          },
        },
        { new: true },
      );

      res.status(200).json({
        success: true,
        data: updatedUnit,
      });
    } catch (error) {
      console.error("Error updating unit:", error);
      next(createError(500, "Server error"));
    }
  }

  /**
   * Update unit status
   */
  public async updateUnitStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const unitId = req.params.id;
      const { status, reservedByOrReason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(unitId)) {
        next(createError(400, "Invalid unit ID format"));
        return;
      }

      if (!status) {
        next(createError(400, "Status is required"));
        return;
      }

      // Validate status
      const validStatuses: UnitType["status"][] = [
        "reserved",
        "available",
        "booked",
        "registered",
        "canceled",
        "investor",
        "not-for-sale",
        "others",
      ];

      if (!validStatuses.includes(status as UnitType["status"])) {
        next(
          createError(
            400,
            `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          ),
        );
        return;
      }

      // Find the unit first to ensure it exists
      const existingUnit = await Unit.findById(unitId);
      if (!existingUnit) {
        next(createError(404, "Unit not found"));
        return;
      }

      const updateObj: any = { status };

      if (status === "available") {
        updateObj.reservedByOrReason = null;
      } else if (reservedByOrReason) {
        updateObj.reservedByOrReason =
          reservedByOrReason || existingUnit.reservedByOrReason;
      }

      const updatedUnit = await Unit.findByIdAndUpdate(
        unitId,
        { $set: updateObj },
        { new: true },
      );

      res.status(200).json({
        success: true,
        data: updatedUnit,
      });
    } catch (error) {
      console.error("Error updating unit status:", error);
      next(createError(500, "Server error"));
    }
  }

  /**
   * Delete a unit
   */
  public async deleteUnit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const unitId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(unitId)) {
        next(createError(400, "Invalid unit ID format"));
        return;
      }

      const unit = await Unit.findById(unitId);
      if (!unit) {
        next(createError(404, "Unit not found"));
        return;
      }

      // Remove unit from floor's units array
      await Floor.findByIdAndUpdate(unit.floorId, {
        $pull: { units: unitId },
      });

      // Delete the unit
      await Unit.findByIdAndDelete(unitId);

      res.status(200).json({
        success: true,
        message: "Unit deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting unit:", error);
      next(createError(500, "Server error"));
    }
  }
}

export const unitController = new UnitController();

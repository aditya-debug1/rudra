import { NextFunction, Request, Response } from "express";
import { RemarkType, Visit } from "../models/visit";
import { Client } from "../models/client";
import { CPEmployee } from "../models/client-partner";
import createError from "../utils/createError";
import auditService from "../utils/audit-service";
import mongoose from "mongoose";

class VisitController {
  async createVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId, reference, ...visitData } = req.body;

      const client = await Client.findById(clientId);
      if (!client) {
        return next(createError(404, "Client not found"));
      }

      const visit = new Visit({
        ...visitData,
        reference,
        client: clientId,
      });

      await visit.save();

      await Client.findByIdAndUpdate(clientId, {
        $push: { visits: visit._id },
      });

      // Check if reference matches a CPEmployee ID and update referredClients
      if (reference && mongoose.Types.ObjectId.isValid(reference)) {
        const cpEmployee = await CPEmployee.findOne({ _id: reference });
        if (cpEmployee) {
          await CPEmployee.findByIdAndUpdate(reference, {
            $push: { referredClients: visit._id },
          });
        }
      }

      // Create audit log
      await auditService.logCreate(
        visit,
        req,
        "Visit",
        `Created visit for client: ${client.firstName + " " + client.lastName}`,
      );

      res.status(201).json({
        message: "Visit created successfully",
        visit,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error creating visit",
        ),
      );
    }
  }

  async updateVisit(req: Request, res: Response, next: NextFunction) {
    try {
      // First fetch the original visit data
      const originalVisit = await Visit.findById(req.params.id);
      if (!originalVisit) {
        return next(createError(404, "Visit not found"));
      }

      // Get the client information for the audit log
      const client = await Client.findById(originalVisit.client);
      if (!client) {
        return next(createError(404, "Client not found"));
      }

      const { reference } = req.body;

      // Check if reference is being updated
      if (reference && reference !== originalVisit.reference) {
        // If the original reference was a CP employee, remove the client from their referredClients
        if (
          originalVisit.reference &&
          mongoose.Types.ObjectId.isValid(originalVisit.reference)
        ) {
          await CPEmployee.findByIdAndUpdate(originalVisit.reference, {
            $pull: { referredClients: originalVisit._id },
          });
        }

        if (mongoose.Types.ObjectId.isValid(reference)) {
          // Check if new reference matches a CPEmployee ID and update referredClients
          const cpEmployee = await CPEmployee.findOne({ _id: reference });
          if (cpEmployee) {
            await CPEmployee.findByIdAndUpdate(reference, {
              $push: { referredClients: originalVisit._id },
            });
          }
        }
      }

      // Then update the visit
      const updatedVisit = await Visit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      ).populate("remarks");

      // Create audit log with original and updated data
      await auditService.logUpdate(
        originalVisit,
        updatedVisit,
        req,
        "Visit",
        `Updated visit for client: ${client.firstName + " " + client.lastName}`,
      );

      res.status(200).json({
        message: "Visit updated successfully",
        visit: updatedVisit,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error updating visit",
        ),
      );
    }
  }

  async deleteVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await Visit.findById(req.params.id);

      if (!visit) {
        return next(createError(404, "Visit not found"));
      }

      const clientId = visit.get("client");
      const client = await Client.findById(visit.get("client")).populate(
        "visits",
      );

      // Check if client exists and has more than one visit
      if (!client) {
        return next(createError(404, "Client not found"));
      }

      if (client.visits.length <= 1) {
        return next(
          createError(
            400,
            "Cannot delete the only visit for this client. A client must have at least one visit.",
          ),
        );
      }

      // Remove the client from the CP employee's referredClients if applicable
      if (mongoose.Types.ObjectId.isValid(visit.reference) && visit.reference) {
        await CPEmployee.findByIdAndUpdate(visit.reference, {
          $pull: { referredClients: visit._id },
        });
      }

      await Client.findByIdAndUpdate(clientId, {
        $pull: { visits: visit._id },
      });

      // Create audit log
      await auditService.logDelete(
        visit,
        req,
        "Visit",
        `Deleted visit for client: ${client.firstName + " " + client.lastName}`,
      );

      await visit.deleteOne();

      res.status(200).json({
        message: "Visit deleted successfully",
        visitId: visit._id,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error deleting visit",
        ),
      );
    }
  }

  async createRemark(req: Request, res: Response, next: NextFunction) {
    try {
      const { remark } = req.body;

      if (typeof remark !== "string") {
        return next(createError(400, "Invalid remark format"));
      }

      const visit = await Visit.findById(req.params.id);

      if (!visit) {
        return next(createError(404, "Visit not found"));
      }

      visit.remarks.push({ date: new Date(), remark } as RemarkType);
      await visit.save();

      res.status(201).json({
        message: "Remark added successfully",
        visit,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error adding remark",
        ),
      );
    }
  }

  async deleteRemark(req: Request, res: Response, next: NextFunction) {
    try {
      const { remarkId } = req.params;

      const visit = await Visit.findOneAndUpdate(
        { "remarks._id": remarkId },
        { $pull: { remarks: { _id: remarkId } } },
        { new: true },
      );

      if (!visit) {
        return next(createError(404, "Visit or remark not found"));
      }

      res.status(200).json({
        message: "Remark deleted successfully",
        visit,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error deleting remark",
        ),
      );
    }
  }
}

export default new VisitController();

import { NextFunction, Request, Response } from "express";
import { RemarkType, Visit } from "../models/visit";
import { Client } from "../models/client";
import createError from "../utils/createError";

class VisitController {
  async createVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId, ...visitData } = req.body;

      const client = await Client.findById(clientId);
      if (!client) {
        return next(createError(404, "Client not found"));
      }

      const visit = new Visit({
        ...visitData,
        client: clientId,
      });

      await visit.save();

      await Client.findByIdAndUpdate(clientId, {
        $push: { visits: visit._id },
      });

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
      const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).populate("remarks");

      if (!visit) {
        return next(createError(404, "Visit not found"));
      }

      res.status(200).json({
        message: "Visit updated successfully",
        visit,
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

      await Client.findByIdAndUpdate(clientId, {
        $pull: { visits: visit._id },
      });

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

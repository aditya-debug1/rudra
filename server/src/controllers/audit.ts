import { NextFunction, Request, Response } from "express";
import AuditLog from "../models/audit";
import createError from "../utils/createError";

class AuditLogController {
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        source,
        userId,
        action,
        startDate,
        endDate,
      } = req.query;
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      let query: any = {};

      // Apply search filter if provided
      if (search) {
        const searchTerms = (search as string).trim().split(/\s+/);
        query.$and = searchTerms.map((term) => {
          const termRegex = new RegExp(term, "i");
          return {
            $or: [
              { source: termRegex },
              { description: termRegex },
              { "actor.userId": termRegex },
              { "actor.username": termRegex },
              { "event.action": termRegex },
            ],
          };
        });
      }

      // Apply specific filters
      if (source) query.source = source;
      if (userId) query["actor.userId"] = userId;
      if (action) query["event.action"] = action;

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.timestamp.$lte = new Date(endDate as string);
        }
      }

      // Execute query with pagination
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ timestamp: -1 })
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber),
        AuditLog.countDocuments(query),
      ]);

      res.status(200).json({
        logs,
        currentPage: pageNumber,
        limitPerPage: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalLogs: total,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching audit logs",
        ),
      );
    }
  }

  async getLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await AuditLog.findById(req.params.id);

      if (!log) {
        return next(createError(404, "Audit log not found"));
      }

      res.status(200).json(log);
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching audit log",
        ),
      );
    }
  }

  async createLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { event, actor, source, description } = req.body;

      const newLog = new AuditLog({
        event: {
          action: event.action,
          changes: event.changes,
        },
        actor: {
          userId: actor.userId,
          username: actor.username,
          roles: actor.roles,
        },
        source,
        description,
        timestamp: new Date(),
      });

      await newLog.save();

      res.status(201).json({
        message: "Audit log created successfully",
        logId: newLog._id,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error creating audit log",
        ),
      );
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const [actionStats, sourceStats, recentActivity] = await Promise.all([
        // Count by action type
        AuditLog.aggregate([
          {
            $group: {
              _id: "$event.action",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ]),
        // Count by source
        AuditLog.aggregate([
          {
            $group: {
              _id: "$source",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ]),
        // Recent activity
        AuditLog.find().sort({ timestamp: -1 }).limit(5),
      ]);

      res.status(200).json({
        statistics: {
          actionStats,
          sourceStats,
          recentActivity,
        },
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Error fetching audit statistics",
        ),
      );
    }
  }

  async getSources(req: Request, res: Response, next: NextFunction) {
    try {
      // Get all unique sources from the audit logs
      const sources = await AuditLog.distinct("source");

      // Sort the sources alphabetically for better readability
      sources.sort();

      res.status(200).json({
        sources,
        count: sources.length,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Error fetching audit sources",
        ),
      );
    }
  }
}

export default new AuditLogController();

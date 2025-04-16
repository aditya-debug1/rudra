import { NextFunction, Request, Response } from "express";
import { Client } from "../models/client";
import { Visit } from "../models/visit";
import createError from "../utils/createError";

class ClientController {
  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        firstName,
        lastName,
        occupation,
        email,
        phoneNo,
        altNo,
        address,
        note,
        project,
        requirement,
        budget,
        visitData,
      } = req.body;

      const client = new Client({
        firstName,
        lastName,
        occupation,
        email,
        phoneNo,
        altNo,
        address,
        note,
        project,
        requirement,
        budget,
      });

      await client.save();

      const visit = new Visit({
        ...visitData,
        client: client._id,
      });

      await visit.save();

      // Add visit reference to client using $push
      await Client.findByIdAndUpdate(client._id, {
        $push: { visits: visit._id },
      });

      res.status(201).json({
        message: "Client created successfully",
        client,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error creating client",
        ),
      );
    }
  }

  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        manager,
        search,
        minBudget,
        maxBudget,
        requirement,
        project,
        fromDate,
        toDate,
        reference,
        source,
        relation,
        closing,
        status,
      } = req.query;

      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      // Build pipeline for aggregation
      const pipeline: any[] = [];

      // Search filter
      if (search) {
        const searchTerms = (search as string).trim().split(/\s+/);
        const searchConditions: any[] = searchTerms.map((term) => {
          const termRegex = new RegExp(term, "i");
          return {
            $or: [
              { firstName: termRegex },
              { lastName: termRegex },
              { occupation: termRegex },
              { email: termRegex },
              { phoneNo: termRegex },
              { altNo: termRegex },
              { address: termRegex },
              { project: termRegex },
              { requirement: termRegex },
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ["$firstName", " ", "$lastName"] },
                    regex: termRegex,
                  },
                },
              },
            ],
          };
        });

        if (searchConditions.length > 0) {
          pipeline.push({ $match: { $and: searchConditions } });
        }
      }

      // Budget filters
      if (minBudget || maxBudget) {
        const budgetMatch: any = {};

        if (minBudget) budgetMatch.budget = { $gte: Number(minBudget) };
        if (maxBudget) {
          if (budgetMatch.budget) {
            budgetMatch.budget.$lte = Number(maxBudget);
          } else {
            budgetMatch.budget = { $lte: Number(maxBudget) };
          }
        }

        pipeline.push({ $match: budgetMatch });
      }

      // Requirement and project filters
      const additionalFilters: any = {};
      if (requirement) additionalFilters.requirement = requirement;
      if (project) additionalFilters.project = project;

      if (Object.keys(additionalFilters).length > 0) {
        pipeline.push({ $match: additionalFilters });
      }

      // Lookup visits and ensure client has at least one visit
      pipeline.push(
        {
          $lookup: {
            from: "visits",
            localField: "_id",
            foreignField: "client",
            as: "visits",
          },
        },
        {
          $match: {
            "visits.0": { $exists: true }, // Ensure at least one visit exists
          },
        },
        {
          $addFields: {
            // Sort visits by date descending and get the latest visit
            visits: { $sortArray: { input: "$visits", sortBy: { date: -1 } } },
          },
        },
      );

      // Visit filters based on the latest visit
      const visitFilters: any = {};

      if (manager) {
        visitFilters.$or = [
          { "visits.0.source": manager },
          { "visits.0.relation": manager },
          { "visits.0.closing": manager },
        ];
      }

      if (fromDate || toDate) {
        visitFilters["visits.0.date"] = {};
        if (fromDate) {
          const fromDateObj = new Date(fromDate as string);
          fromDateObj.setHours(0, 0, 0, 0);
          visitFilters["visits.0.date"].$gte = fromDateObj;
        }
        if (toDate) {
          const toDateObj = new Date(toDate as string);
          toDateObj.setHours(23, 59, 59, 999);
          visitFilters["visits.0.date"].$lte = toDateObj;
        }
      }

      if (reference) visitFilters["visits.0.reference"] = reference;
      if (source) visitFilters["visits.0.source"] = source;
      if (relation) visitFilters["visits.0.relation"] = relation;
      if (closing) visitFilters["visits.0.closing"] = closing;
      if (status) visitFilters["visits.0.status"] = status;

      if (Object.keys(visitFilters).length > 0) {
        pipeline.push({ $match: visitFilters });
      }

      // Count total before pagination
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: "total" });
      const countResult = await Client.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Apply pagination
      pipeline.push(
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber },
      );

      // Execute the final query
      const clients = await Client.aggregate(pipeline);

      res.status(200).json({
        clients,
        currentPage: pageNumber,
        limitNumber: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalClients: total,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching clients",
        ),
      );
    }
  }

  async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await Client.findById(req.params.id).populate({
        path: "visits",
        options: { sort: { date: 1 } },
        populate: { path: "remarks" },
      });

      if (!client) {
        return next(createError(404, "Client not found"));
      }

      res.status(200).json(client);
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error fetching client",
        ),
      );
    }
  }

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        firstName,
        lastName,
        occupation,
        email,
        phoneNo,
        altNo,
        address,
        note,
        project,
        requirement,
        budget,
      } = req.body;

      const client = await Client.findByIdAndUpdate(
        req.params.id,
        {
          firstName,
          lastName,
          occupation,
          email,
          phoneNo,
          altNo,
          address,
          note,
          project,
          requirement,
          budget,
        },
        { new: true },
      ).populate({
        path: "visits",
        options: { sort: { date: -1 }, limit: 1 },
        populate: { path: "remarks" },
      });

      if (!client) {
        return next(createError(404, "Client not found"));
      }

      res.status(200).json({
        message: "Client updated successfully",
        client,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error updating client",
        ),
      );
    }
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await Client.findById(req.params.id);

      if (!client) {
        return next(createError(404, "Client not found"));
      }

      await Visit.deleteMany({ client: client._id });
      await client.deleteOne();

      res.status(200).json({
        message: "Client deleted successfully",
        clientId: client._id,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Error deleting client",
        ),
      );
    }
  }
}

export default new ClientController();

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
        search,
        status,
        reference,
        source,
        relation,
        closing,
      } = req.query;

      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      // Construct visit filter query
      const visitFilter: any = {};
      if (status) visitFilter.status = status as string;
      if (reference) visitFilter.reference = reference as string;
      if (source) visitFilter.source = source as string;
      if (relation) visitFilter.relation = relation as string;
      if (closing) visitFilter.closing = closing as string;

      // Text search query for clients
      let clientQuery: any = {};
      if (search) {
        const searchTerms = (search as string).trim().split(/\s+/);
        clientQuery.$and = searchTerms.map((term) => {
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
      }

      // Add filter to ensure clients have at least one visit
      clientQuery.visits = { $exists: true, $ne: [] };

      // Find clients with their latest visit matching the filter
      const clients = await Client.aggregate([
        { $match: clientQuery },
        {
          $lookup: {
            from: "visits",
            let: { clientVisits: "$visits" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$clientVisits"] },
                      ...Object.entries(visitFilter).map(([key, value]) => ({
                        $eq: [`$${key}`, value],
                      })),
                    ],
                  },
                },
              },
              { $sort: { date: -1 } },
              { $limit: 1 },
            ],
            as: "latestMatchingVisit",
          },
        },
        {
          $match: {
            ...(Object.keys(visitFilter).length > 0
              ? { latestMatchingVisit: { $ne: [] } }
              : {}),
          },
        },
        { $unset: "latestMatchingVisit" },
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber },
      ]);

      // Count total matching clients
      const totalClients = await Client.aggregate([
        { $match: clientQuery },
        {
          $lookup: {
            from: "visits",
            let: { clientVisits: "$visits" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$clientVisits"] },
                      ...Object.entries(visitFilter).map(([key, value]) => ({
                        $eq: [`$${key}`, value],
                      })),
                    ],
                  },
                },
              },
              { $sort: { date: -1 } },
              { $limit: 1 },
            ],
            as: "latestMatchingVisit",
          },
        },
        {
          $match: {
            ...(Object.keys(visitFilter).length > 0
              ? { latestMatchingVisit: { $ne: [] } }
              : {}),
          },
        },
        { $count: "total" },
      ]);

      // Populate visits for the returned clients
      const populatedClients = await Client.populate(clients, {
        path: "visits",
        options: { sort: { date: -1 }, limit: 1 },
        populate: { path: "remarks" },
      });

      const total = totalClients[0]?.total || 0;

      res.status(200).json({
        clients: populatedClients,
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
        options: { sort: { date: -1 } },
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

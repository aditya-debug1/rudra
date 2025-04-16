import { NextFunction, Request, Response } from "express";
import { Client, PopulatedClients } from "../models/client";
import createError from "../utils/createError";

async function getClients(req: Request, res: Response, next: NextFunction) {
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

    const clientQuery: any = {};

    // Search filter query
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

    // Clinet Filters
    if (minBudget || maxBudget) {
      clientQuery.budget = {};
      if (minBudget) clientQuery.budget.$gte = Number(minBudget);
      if (maxBudget) clientQuery.budget.$lte = Number(maxBudget);
    }

    if (requirement) clientQuery.requirement = requirement;
    if (project) clientQuery.project = project;

    // Get all matching clients with visits populated and sorted
    const allClients = await Client.find(clientQuery)
      .populate({
        path: "visits",
        options: { sort: { date: -1 } },
      })
      .lean();

    const populatedClients = allClients as unknown as PopulatedClients[];

    // Filter clients with at least one visit
    let filteredClients = populatedClients.filter(
      (client) => client.visits.length > 0,
    );

    // Visit filters on last visit
    if (manager) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        return (
          latestVisit &&
          (latestVisit.source === manager ||
            latestVisit.relation === manager ||
            latestVisit.closing === manager)
        );
      });
    }

    if (fromDate || toDate) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        if (!latestVisit || !latestVisit.date) return false;

        const visitDate = new Date(latestVisit.date);
        const from = fromDate ? new Date(fromDate as string) : null;
        const to = toDate ? new Date(toDate as string) : null;

        if (from) from.setHours(0, 0, 0, 0); // Set to 00:00:00
        if (to) to.setHours(23, 59, 59, 999); // Set to 23:59:59.999

        return (!from || visitDate >= from) && (!to || visitDate <= to);
      });
    }

    if (reference) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        return latestVisit && latestVisit.reference === reference;
      });
    }

    if (source) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        return latestVisit && latestVisit.source === source;
      });
    }

    if (relation) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        return latestVisit && latestVisit.relation === relation;
      });
    }

    if (closing) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        return latestVisit && latestVisit.closing === closing;
      });
    }

    if (status) {
      filteredClients = filteredClients.filter((client) => {
        const latestVisit = client.visits[0];
        return latestVisit && latestVisit.status === status;
      });
    }

    // Paginate after filtering
    const total = filteredClients.length;
    const paginatedClients = filteredClients.slice(
      (pageNumber - 1) * limitNumber,
      pageNumber * limitNumber,
    );

    res.status(200).json({
      clients: paginatedClients,
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

export default getClients;

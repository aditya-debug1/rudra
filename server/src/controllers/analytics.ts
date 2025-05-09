import { Request, Response, NextFunction } from "express";
import { Client } from "../models/client";
import createError from "../utils/createError";
import { VisitType } from "../models/visit";

type StatusKey = "hot" | "warm" | "cold" | "lost" | "booked";

function isValidStatus(status: string): status is StatusKey {
  return ["hot", "warm", "cold", "lost", "booked"].includes(status);
}

class analyticsController {
  async getClientStatusCounts(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract query parameters for potential filtering
      const { startDate, endDate, manager } = req.query;

      // Build date filter if dates are provided
      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.date = {};
        if (startDate) {
          const start = new Date(startDate as string);
          start.setHours(0, 0, 0, 0);
          dateFilter.date.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          dateFilter.date.$lte = end;
        }
      }

      // Build manager filter if manager is provided
      let managerFilter = {};
      if (manager) {
        managerFilter = {
          $or: [
            { source: manager },
            // { relation: manager },
            // { closing: manager },
          ],
        };
      }

      // Combine filters
      const combinedFilter = {
        ...dateFilter,
        ...managerFilter,
      };

      // Fetch all clients with their latest visit
      const clients = await Client.find().populate<{ visits: VisitType[] }>({
        path: "visits",
        options: { sort: { date: -1 }, limit: 1 },
        match:
          Object.keys(combinedFilter).length > 0 ? combinedFilter : undefined,
      });

      // Initialize the status counts
      const statusCounts = {
        hot: 0,
        warm: 0,
        cold: 0,
        lost: 0,
        booked: 0,
      };

      // Count clients by their most recent visit status
      for (const client of clients) {
        if (!client.visits || client.visits.length === 0) {
          // Skip clients with no visits instead of counting them
          continue;
        }

        // Get the status from the most recent visit
        const lastVisit = client.visits[0];
        const status = lastVisit.status;

        if (isValidStatus(status)) {
          statusCounts[status]++;
        }
      }

      res.status(200).json(statusCounts);
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Failed to fetch client status analytics",
        ),
      );
    }
  }

  async getYearlyBookingStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract the year from query parameters, default to current year
      const year =
        parseInt(req.query.year as string) || new Date().getFullYear();

      // Create date range for the specified year
      const startDate = new Date(year, 0, 1); // January 1st of the specified year
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the specified year

      // Optionally filter by manager if provided
      const { manager } = req.query;
      let managerFilter = {};
      if (manager) {
        managerFilter = {
          $or: [
            { source: manager },
            { relation: manager },
            { closing: manager },
          ],
        };
      }

      // Get all clients with their visits within the specified year
      const clients = await Client.find().populate<{ visits: VisitType[] }>({
        path: "visits",
        match: {
          date: { $gte: startDate, $lte: endDate },
          ...managerFilter,
        },
        options: { sort: { date: -1 } }, // Sort visits by date descending
      });

      // Initialize monthly statistics array
      const monthlyStats = Array(12)
        .fill(0)
        .map(() => ({
          client: 0, // Total clients that visited
          booking: 0, // Clients with "booked" status
        }));

      // Process each client ONCE based on their most recent visit only
      for (const client of clients) {
        if (!client.visits || client.visits.length === 0) continue;

        // Only use the most recent visit for this client
        const latestVisit = client.visits[0]; // Already sorted by date descending
        const visitDate = new Date(latestVisit.date);
        const month = visitDate.getMonth(); // 0-based (January is 0)

        // Count this client once in the month of their latest visit
        monthlyStats[month].client++;

        // Check if the latest status is "booked"
        if (latestVisit.status === "booked") {
          monthlyStats[month].booking++;
        }
      }

      // Format the response with month names
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Filter out months with no clients
      const formattedResponse = monthlyStats
        .map((stats, index) => ({
          month: monthNames[index],
          client: stats.client,
          booking: stats.booking,
        }))
        .filter((month) => month.client > 0);

      // Calculate summary totals
      const totalClients = formattedResponse.reduce(
        (sum, month) => sum + month.client,
        0,
      );

      const totalBookings = formattedResponse.reduce(
        (sum, month) => sum + month.booking,
        0,
      );

      // Calculate average booking rate
      const averageBookingRate =
        totalClients > 0 ? (totalBookings / totalClients) * 100 : 0;

      res.status(200).json({
        year,
        monthlyStats: formattedResponse,
        summary: {
          totalClientsForYear: totalClients,
          totalBookingsForYear: totalBookings,
          averageBookingRate: averageBookingRate,
        },
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Failed to fetch yearly booking statistics",
        ),
      );
    }
  }
}

export default new analyticsController();

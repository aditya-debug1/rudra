import { Request, Response } from "express";
import ClientBooking from "../models/clientBooking";
import { Visit } from "../models/visit";

interface ProjectStats {
  projectName: string;
  bookings: number;
}

interface SalesManagerStats {
  salesManager: string;
  totalBookings: number;
  totalRegisterations: number;
  canceledBookings: number;
  totalVisits: number;
  projects: ProjectStats[];
}

export const getSalesManagerStats = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate are required as query parameters",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Adjust date range to include the entire day
    const adjustedStart = new Date(start);
    adjustedStart.setHours(0, 0, 0, 0);
    const adjustedEnd = new Date(end);
    adjustedEnd.setHours(23, 59, 59, 999);

    // Get unique sales managers from BOTH bookings and visits
    const salesManagersFromBookings = await ClientBooking.distinct(
      "salesManager",
      {
        date: { $gte: adjustedStart, $lte: adjustedEnd },
      },
    );

    // Extract sales managers from visits (from the source field)
    const visitsWithSource = await Visit.find(
      {
        date: { $gte: adjustedStart, $lte: adjustedEnd },
        source: { $exists: true, $ne: null, $nin: ["", null] },
      },
      { source: 1 },
    );

    // Extract unique sales manager names from source field
    const salesManagersFromVisits = [
      ...new Set(
        visitsWithSource
          .map((visit) => visit.source?.trim())
          .filter((source) => source && source.length > 0),
      ),
    ];

    // Combine and deduplicate all sales managers
    const allSalesManagers = [
      ...new Set([...salesManagersFromBookings, ...salesManagersFromVisits]),
    ].filter(Boolean); // Remove any null/undefined values

    // Then perform aggregation for each sales manager
    const results = await Promise.all(
      allSalesManagers.map(async (salesManager) => {
        // Count bookings for this sales manager
        const bookingStats = await ClientBooking.aggregate([
          {
            $match: {
              date: { $gte: adjustedStart, $lte: adjustedEnd },
              salesManager: salesManager,
            },
          },
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              totalRegisterations: {
                $sum: {
                  $cond: [{ $eq: ["$status", "registered"] }, 1, 0],
                },
              },
              canceledBookings: {
                $sum: {
                  $cond: [{ $eq: ["$status", "canceled"] }, 1, 0],
                },
              },
            },
          },
        ]);

        // Get project-wise booking counts (excluding canceled and registered)
        const projectStats = await ClientBooking.aggregate([
          {
            $match: {
              date: { $gte: adjustedStart, $lte: adjustedEnd },
              salesManager: salesManager,
              status: { $nin: ["canceled", "registered"] },
            },
          },
          {
            $group: {
              _id: "$project",
              bookings: { $sum: 1 },
            },
          },
          {
            $project: {
              projectName: "$_id",
              bookings: 1,
              _id: 0,
            },
          },
        ]);

        // Count visits where this sales manager appears in source
        const visitCount = await Visit.countDocuments({
          date: { $gte: adjustedStart, $lte: adjustedEnd },
          source: { $regex: new RegExp(`^${salesManager}$`, "i") },
        });

        return {
          salesManager,
          totalBookings: bookingStats[0]?.totalBookings || 0,
          totalRegisterations: bookingStats[0]?.totalRegisterations || 0,
          canceledBookings: bookingStats[0]?.canceledBookings || 0,
          totalVisits: visitCount,
          projects: projectStats,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: results as SalesManagerStats[],
      message: "Sales manager statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching sales manager stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

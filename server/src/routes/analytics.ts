import express from "express";
import analyticsController from "../controllers/analytics";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Get client status
router.get(
  "/client-status",
  verifyToken,
  analyticsController.getClientStatusCounts,
);

// Get booking status
router.get(
  "/booking-status",
  verifyToken,
  analyticsController.getYearlyBookingStats,
);

// Get booking status
router.get(
  "/registration-status",
  verifyToken,
  analyticsController.getYearlyRegistrationStats,
);

export default router;

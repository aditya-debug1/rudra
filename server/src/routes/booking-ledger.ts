import express from "express";
import BookingLedgerController from "../controllers/booking-ledger";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Create a new payment entry in the booking ledger
router.post("/", verifyToken, BookingLedgerController.create);

// Get all payments by client with pagination and filtering
router.get(
  "/client/:clientId",
  verifyToken,
  BookingLedgerController.getAllByClient,
);

// Soft delete a payment entry
router.delete("/:id", verifyToken, BookingLedgerController.softDelete);

// Restore a soft deleted payment entry
router.patch("/:id/restore", verifyToken, BookingLedgerController.restore);

export default router;

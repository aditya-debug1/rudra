import express from "express";
import clientBookingController from "../controllers/clientBooking";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Create a new client booking
router.post("/", verifyToken, clientBookingController.create);

// Get all client bookings
router.get("/", verifyToken, clientBookingController.getAll);

// Get client booking by ID
router.get("/:id", verifyToken, clientBookingController.getById);

// Update client booking
router.patch("/:id", verifyToken, clientBookingController.update);

// Delete client booking
router.delete("/:id", verifyToken, clientBookingController.delete);

export default router;

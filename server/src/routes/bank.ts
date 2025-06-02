import express from "express";
import bankController from "../controllers/bank";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Get all bank accounts
router.get("/", bankController.getAll);

// Get bank account by ID
router.get("/:id", verifyToken, bankController.getById);

export default router;

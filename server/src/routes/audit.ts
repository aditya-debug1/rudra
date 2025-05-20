import express from "express";
import auditLogController from "../controllers/audit";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Get audit logs with pagination and filters
router.get("/logs", verifyToken, auditLogController.getLogs);

// Get a single audit log by ID
router.get("/logs/:id", verifyToken, auditLogController.getLogById);

// Create a new audit log
router.post("/logs", verifyToken, auditLogController.createLog);

// Get audit sources
router.get("/sources", auditLogController.getSources);

// Get audit statistics
router.get("/statistics", verifyToken, auditLogController.getStatistics);

export default router;

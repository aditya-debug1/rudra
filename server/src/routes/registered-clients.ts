// src/routes/registered-clients.ts
import express from "express";
import registeredClientsController from "../controllers/registered-clients";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Get summary for all projects
router.get(
  "/summary",
  verifyToken,
  registeredClientsController.getAllProjectsSummary,
);

// Get registered clients by project
router.get(
  "/project/:project",
  // verifyToken,
  registeredClientsController.getRegisteredClientsByProject,
);

export default router;

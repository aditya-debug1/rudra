// routes/clientPartnerRoutes.ts
import express from "express";
import ClientPartnerController from "../controllers/client-partner";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Get all client partners
router.get("/", verifyToken, ClientPartnerController.getAllClientPartners);

// Create a new client partner
router.post("/", verifyToken, ClientPartnerController.createClientPartner);

// Get reference list
router.get("/reference", verifyToken, ClientPartnerController.getReference);

// Get client partner by ID
router.get("/:id", verifyToken, ClientPartnerController.getClientPartner);

// Update client partner
router.put("/:id", verifyToken, ClientPartnerController.updateClientPartner);

// Soft delete client partner
router.delete("/:id", verifyToken, ClientPartnerController.deleteClientPartner);

// Hard delete client partner (admin only)
router.delete(
  "/:id/hard",
  verifyToken,
  ClientPartnerController.hardDeleteClientPartner,
);

// Restore soft-deleted client partner
router.post(
  "/:id/restore",
  verifyToken,
  ClientPartnerController.restoreClientPartner,
);

// Add employee to client partner
router.post("/:id/employees", verifyToken, ClientPartnerController.addEmployee);

// Update employee
router.put(
  "/:id/employees/:employeeId",
  verifyToken,
  ClientPartnerController.updateEmployee,
);

// Soft remove employee
router.delete(
  "/:id/employees/:employeeId",
  verifyToken,
  ClientPartnerController.removeEmployee,
);

// Hard remove employee (admin only)
router.delete(
  "/:id/employees/:employeeId/hard",
  verifyToken,
  ClientPartnerController.hardRemoveEmployee,
);

// Restore soft-deleted employee
router.post(
  "/:id/employees/:employeeId/restore",
  verifyToken,
  ClientPartnerController.restoreEmployee,
);

export default router;

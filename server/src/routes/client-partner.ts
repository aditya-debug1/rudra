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

// Delete client partner
router.delete("/:id", verifyToken, ClientPartnerController.deleteClientPartner);

// Add employee to client partner
router.post("/:id/employees", verifyToken, ClientPartnerController.addEmployee);

// Update employee
router.put(
  "/:id/employees/:employeeId",
  verifyToken,
  ClientPartnerController.updateEmployee,
);

// Remove employee
router.delete(
  "/:id/employees/:employeeId",
  verifyToken,
  ClientPartnerController.removeEmployee,
);

export default router;

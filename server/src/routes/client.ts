import express from "express";
import ClientController from "../controllers/client";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Create a new client
router.post("/", verifyToken, ClientController.createClient);

// Get all clients
router.get("/", verifyToken, ClientController.getClients);

// Get client by ID
router.get("/:id", verifyToken, ClientController.getClient);

// Update client
router.patch("/:id", verifyToken, ClientController.updateClient);

// Delete client
router.delete("/:id", verifyToken, ClientController.deleteClient);

export default router;

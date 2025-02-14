import express from "express";
import AuthController from "../controllers/auth";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Login user
router.post("/login", AuthController.login);

// Logout user
router.post("/logout", verifyToken, AuthController.logout);

// Get current user
router.post("/current-user", verifyToken, AuthController.getCurrentUser);

// Get user auth logs
router.get("/logs", verifyToken, AuthController.getLogs);

export default router;

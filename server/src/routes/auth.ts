import express from "express";
import AuthController from "../controllers/auth";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Login user
router.post("/login", AuthController.login);

// Logout user
router.post("/logout", AuthController.logout);

// Get current user
router.post("/current-user", verifyToken, AuthController.getCurrentUser);

export default router;

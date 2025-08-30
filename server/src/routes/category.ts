import express from "express";
import categoryController from "../controllers/category";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Protect everything below
router.use(verifyToken);

// Get all categories
router.get("/", categoryController.getAll);

// Create a new category
router.post("/", categoryController.create);

// Update a category by ID
router.put("/:id", categoryController.update);

// Delete a category by ID
router.delete("/:id", categoryController.delete);

// Bulk set precedence
router.patch("/precedence", categoryController.setPrecedence);

export default router;

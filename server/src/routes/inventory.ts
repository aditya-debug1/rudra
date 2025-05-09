import express from "express";
import { projectController, unitController } from "../controllers/inventory";
import verifyToken from "../utils/jwt";

const router = express.Router();

router.use(verifyToken);

// Project routes
router.post("/project", projectController.createProject);
router.get("/project", projectController.getAllProjects);
router.get("/project-structure", projectController.getProjectsStructure);
router.get("/project/:projectId", projectController.getProjectById);
router.put("/project/:projectId", projectController.updateProject);
router.delete("/project/:projectId", projectController.deleteProject);

// Unit routes
router.post("/unit", unitController.createUnit);
router.get("/unit", unitController.getAllUnits);
router.get("/unit/:id", unitController.getUnitById);
router.put("/unit/:id", unitController.updateUnit);
router.patch("/unit/:id/status", unitController.updateUnitStatus);
router.delete("/unit/:id", unitController.deleteUnit);

export default router;

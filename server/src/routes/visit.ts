import express from "express";
import VisitCtrl from "../controllers/visit";
import verifyToken from "../utils/jwt";

const router = express.Router();

// Create a new visit
router.post("/", verifyToken, VisitCtrl.createVisit);

// Update visit
router.patch("/:id", verifyToken, VisitCtrl.updateVisit);

// Delete visit
router.delete("/:id", verifyToken, VisitCtrl.deleteVisit);

// Create a new remark
router.post("/:id/remarks", verifyToken, VisitCtrl.createRemark);

// Delete remark
router.delete("/:id/remarks/:remarkId", verifyToken, VisitCtrl.deleteRemark);

export default router;

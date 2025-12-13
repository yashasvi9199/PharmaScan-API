import { Router } from "express";
import { getAllScans, getScanDetail, deleteScan } from "../controllers/history.controller";

const router = Router();

// GET /api/history - Get all scan history
router.get("/", getAllScans);

// GET /api/history/:id - Get single scan detail
router.get("/:id", getScanDetail);

// DELETE /api/history/:id - Delete a scan record
router.delete("/:id", deleteScan);

export default router;

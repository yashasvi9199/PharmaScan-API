import { Router } from "express";
import { handleScan } from "../controllers/scan.controller";

const router = Router();

// POST /api/scan
router.post("/", handleScan);

export default router;

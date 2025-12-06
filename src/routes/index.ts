// src/routes/index.ts
// Aggregates all feature routes for the API.

import { Router } from "express";
import scanRoutes from "./scan.routes";

const router = Router();

// Mount scan feature routes
router.use("/scan", scanRoutes);

export default router;

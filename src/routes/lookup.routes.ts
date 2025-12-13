import { Router } from "express";
import { searchDrugs, getDrugBySlug, getDrugCategories } from "../controllers/lookup.controller";

const router = Router();

// GET /api/lookup/search?q=... - Search for drugs by name
router.get("/search", searchDrugs);

// GET /api/lookup/drug/:slug - Get a specific drug by slug
router.get("/drug/:slug", getDrugBySlug);

// GET /api/lookup/categories - Get available ATC categories
router.get("/categories", getDrugCategories);

export default router;

import { Request, Response } from "express";
import { 
  searchMedicines, 
  getMedicineBySlug, 
  getATCCategories 
} from "../services/lookup.service";

/**
 * GET /api/lookup/search?q=...&limit=...
 * Search for drugs by name or partial match.
 */
export async function searchDrugs(req: Request, res: Response): Promise<void> {
  try {
    const query = String(req.query.q || "").trim();
    const limit = parseInt(String(req.query.limit || "20"), 10);
    
    if (!query) {
      res.status(400).json({ success: false, error: "Query parameter 'q' is required" });
      return;
    }
    
    if (query.length < 2) {
      res.status(400).json({ success: false, error: "Query must be at least 2 characters" });
      return;
    }
    
    const results = await searchMedicines(query, limit);
    res.status(200).json({
      success: true,
      query,
      count: results.length,
      data: results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Search failed", detail: msg });
  }
}

/**
 * GET /api/lookup/drug/:slug
 * Get detailed information about a specific drug.
 */
export async function getDrugBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const drug = await getMedicineBySlug(slug);
    
    if (!drug) {
      res.status(404).json({ success: false, error: "Drug not found" });
      return;
    }
    
    res.status(200).json({ success: true, data: drug });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch drug", detail: msg });
  }
}

/**
 * GET /api/lookup/categories
 * Get ATC category structure for browsing.
 */
export async function getDrugCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await getATCCategories();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch categories", detail: msg });
  }
}

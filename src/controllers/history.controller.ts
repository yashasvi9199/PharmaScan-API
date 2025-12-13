import { Request, Response } from "express";
import { getHistory, getScanById, removeScan } from "../services/history.service";

/**
 * GET /api/history
 * Returns all scan records, sorted by most recent first.
 */
export async function getAllScans(_req: Request, res: Response): Promise<void> {
  try {
    const scans = await getHistory();
    res.status(200).json({
      success: true,
      count: scans.length,
      data: scans,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch history", detail: msg });
  }
}

/**
 * GET /api/history/:id
 * Returns a single scan record by ID.
 */
export async function getScanDetail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const scan = await getScanById(id);
    
    if (!scan) {
      res.status(404).json({ success: false, error: "Scan not found" });
      return;
    }
    
    res.status(200).json({ success: true, data: scan });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch scan", detail: msg });
  }
}

/**
 * DELETE /api/history/:id
 * Deletes a scan record by ID.
 */
export async function deleteScan(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await removeScan(id);
    
    if (!deleted) {
      res.status(404).json({ success: false, error: "Scan not found" });
      return;
    }
    
    res.status(200).json({ success: true, message: "Scan deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to delete scan", detail: msg });
  }
}

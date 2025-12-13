import { getAllScans, getScanById as getById, deleteScan } from "../repositories/scan.repository";
import type { ScanResult } from "../types/scan.types";

/**
 * Get all scan history, sorted by most recent first.
 */
export async function getHistory(): Promise<ScanResult[]> {
  const scans = await getAllScans();
  // Sort by createdAt descending (most recent first)
  return scans.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single scan by ID.
 */
export async function getScanById(id: string): Promise<ScanResult | null> {
  return await getById(id);
}

/**
 * Remove a scan by ID. Returns true if deleted, false if not found.
 */
export async function removeScan(id: string): Promise<boolean> {
  return await deleteScan(id);
}

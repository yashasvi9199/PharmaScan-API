import fs from "fs";
import path from "path";
import type { ScanResult } from "../types/scan.types";

const DB_PATH = path.join(process.cwd(), "scan-db.json");

function readDB(): ScanResult[] {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as ScanResult[];
  } catch {
    return [];
  }
}

function writeDB(data: ScanResult[]): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * Get all scans from the database.
 */
export async function getAllScans(): Promise<ScanResult[]> {
  return readDB();
}

/**
 * Save a new scan to the database.
 */
export async function saveScan(record: ScanResult): Promise<void> {
  const db = readDB();
  db.push(record);
  writeDB(db);
}

/**
 * Get a scan by ID.
 */
export async function getScanById(id: string): Promise<ScanResult | null> {
  const db = readDB();
  return db.find((r) => r.id === id) ?? null;
}

/**
 * Delete a scan by ID. Returns true if deleted, false if not found.
 */
export async function deleteScan(id: string): Promise<boolean> {
  const db = readDB();
  const index = db.findIndex((r) => r.id === id);
  
  if (index === -1) {
    return false;
  }
  
  db.splice(index, 1);
  writeDB(db);
  return true;
}

/**
 * Update a scan by ID.
 */
export async function updateScan(id: string, updates: Partial<ScanResult>): Promise<ScanResult | null> {
  const db = readDB();
  const index = db.findIndex((r) => r.id === id);
  
  if (index === -1) {
    return null;
  }
  
  db[index] = { ...db[index], ...updates };
  writeDB(db);
  return db[index];
}

/**
 * Clear all scans (useful for testing).
 */
export async function clearAllScans(): Promise<void> {
  writeDB([]);
}

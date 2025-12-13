import * as fs from "fs";
import * as path from "path";
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

export async function saveScan(record: ScanResult): Promise<void> {
  const db = readDB();
  db.push(record);
  writeDB(db);
}

export async function getScanById(id: string): Promise<ScanResult | null> {
  const db = readDB();
  return db.find((r) => r.id === id) ?? null;
}

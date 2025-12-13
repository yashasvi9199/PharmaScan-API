// src/db/index.ts
// Database connection and utilities
// Currently using JSON file store, can be upgraded to PostgreSQL

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read JSON data from a file
 */
export function readJsonFile<T>(filename: string, defaultValue: T[] = []): T[] {
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filepath)) {
      return defaultValue as T[];
    }
    const raw = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue as T[];
  }
}

/**
 * Write JSON data to a file
 */
export function writeJsonFile<T>(filename: string, data: T[]): void {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

/**
 * Get the data directory path
 */
export function getDataDir(): string {
  return DATA_DIR;
}

// Database health check
export async function checkDbHealth(): Promise<boolean> {
  try {
    // For JSON file store, just check if data dir exists
    return fs.existsSync(DATA_DIR);
  } catch {
    return false;
  }
}

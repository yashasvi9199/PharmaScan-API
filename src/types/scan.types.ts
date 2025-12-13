export interface ScanPayload {
  buffer: Buffer;        // raw image buffer
  filename: string;      // original filename
}

export interface ScanRaw {
  ocr?: {
    text?: string;
    confidence?: number;
    lines?: string[];
    blocks?: Array<{
      text: string;
      confidence?: number;
      bbox?: { x: number; y: number; w: number; h: number };
    }>;
  };
  image?: {
    width?: number;
    height?: number;
    format?: string;
    sizeBytes?: number;
  };
  metadata?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

import { Buffer } from "buffer";

export interface ScanResult {
  id: string;
  extractedText: string;
  confidence?: number;
  raw?: ScanRaw;
  createdAt: string;
  detectedDrugs?: Array<{
    slug: string;
    name: string;
    confidence?: number;
    atc?: string | null;
  }>;
}

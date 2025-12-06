import { runOCR } from "../lib/ocr/ocrAdapter";
import { saveScan } from "../repositories/ocr.repo";
import type { ScanResult } from "../types/scan.types";

export async function processScan(fileBuffer: Buffer, filename: string): Promise<ScanResult> {
  const ocr = await runOCR(fileBuffer);

  const result: ScanResult = {
    id: `scan-${Date.now()}`,
    extractedText: ocr.text ?? "",
    confidence: ocr.confidence,
    raw: { ocr },
    createdAt: new Date().toISOString(),
  };

  await saveScan(result);
  return result;
}

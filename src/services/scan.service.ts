import { runOCR } from "../lib/ocr/ocrAdapter";
import { saveScan } from "../repositories/ocr.repo";
import type { ScanResult } from "../types/scan.types";
import { detectDrugs } from "./dictionary.service";

export async function processScan(fileBuffer: Buffer, filename: string): Promise<ScanResult> {
  const ocr = await runOCR(fileBuffer);
  const text = ocr.text ?? "";

  const detected = await detectDrugs(text);

  const result: ScanResult = {
    id: `scan-${Date.now()}`,
    extractedText: text,
    confidence: ocr.confidence,
    raw: { ocr },
    createdAt: new Date().toISOString(),
    detectedDrugs: detected,
  };

  await saveScan(result);
  return result;
}

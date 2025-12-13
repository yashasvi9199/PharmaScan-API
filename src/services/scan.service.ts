import { runOCR } from "../lib/ocr/ocrAdapter";
import { normalizeText } from "../utils/normalization";
import { detectDrugs } from "./dictionary.service";
import { Buffer } from "buffer";
import { saveScan } from "../repositories/scan.repository";
import type { ScanResult } from "../types/scan.types";

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

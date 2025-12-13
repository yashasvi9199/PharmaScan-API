import { runOCR } from "../lib/ocr/ocrAdapter";
import { normalizeText, cleanOCRText } from "../utils/normalization";
import { detectDrugs } from "./dictionary.service";
import { Buffer } from "buffer";
import { saveScan } from "../repositories/scan.repository";
import type { ScanResult } from "../types/scan.types";

export async function processScan(fileBuffer: Buffer, filename: string): Promise<ScanResult> {
  const ocr = await runOCR(fileBuffer);
  const cleanedText = cleanOCRText(ocr.text ?? "");
  const normalizedText = normalizeText(cleanedText);
  const drugs = await detectDrugs(normalizedText);

  const result: ScanResult & { text: string } = {
    id: `scan-${Date.now()}`,
    extractedText: cleanedText, // Use readable text for display/storage
    text: cleanedText, // Alias for frontend compatibility
    confidence: ocr.confidence,
    raw: { ocr },
    createdAt: new Date().toISOString(),
    detectedDrugs: drugs,
  };

  await saveScan(result);
  return result;
}

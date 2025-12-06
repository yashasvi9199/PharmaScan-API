// src/lib/ocr/ocrAdapter.ts
import Tesseract from "tesseract.js";

export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: Record<string, unknown>;
}

export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  const { data } = await Tesseract.recognize(buffer, "eng");

  return {
    text: data.text ?? "",
    confidence: data.confidence,
    raw: data,
  };
}

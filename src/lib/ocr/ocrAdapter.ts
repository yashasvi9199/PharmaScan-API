import Tesseract from "tesseract.js";

export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: unknown;
}

export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  const { data } = await Tesseract.recognize(buffer, "eng");

  return {
    text: data.text ?? "",
    confidence: // prefer numeric confidence if available, otherwise undefined
      typeof (data as any).confidence === "number" ? (data as any).confidence : undefined,
    raw: data as unknown,
  };
}

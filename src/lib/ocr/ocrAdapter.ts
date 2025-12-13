import sharp from "sharp";
import Tesseract from "tesseract.js";
import { Buffer } from "buffer";

export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: unknown;
}

/**
 * Run OCR with multiple preprocessing strategies to find the best result.
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  const strategies = [
    // Strategy 1: Standard (Grayscale + Normalize)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: false })
        .grayscale()
        .normalise()
        .toBuffer(),

    // Strategy 2: High Contrast Binarization
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: false })
        .grayscale()
        .sharpen()
        .threshold(128)
        .toBuffer(),

    // Strategy 3: Inverted (White text on dark background)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: false })
        .grayscale()
        .negate()
        .normalise()
        .toBuffer(),
  ];

  let bestResult: OCRAdapterResult = { text: "", confidence: 0 };

  for (const strategy of strategies) {
    try {
      const processedBuffer = await strategy(buffer);
      const { data } = await Tesseract.recognize(processedBuffer, "eng", {
        tessedit_pageseg_mode: "11", // PSM 11: Sparse text (better for scattered labels)
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,%-/()[]: ",
        preserve_interword_spaces: "1",
      } as any);

      const confidence = typeof (data as any).confidence === "number" ? (data as any).confidence : 0;
      
      // If this result is significantly better, keep it
      if (confidence > bestResult.confidence!) {
        bestResult = {
          text: data.text ?? "",
          confidence,
          raw: data as unknown,
        };
      }

      // Early exit if we have a very good result
      if (confidence > 85) break;
    } catch (err) {
      console.warn("OCR strategy failed:", err);
    }
  }

  return bestResult;
}


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
        .resize({ width: 2500, withoutEnlargement: false })
        .grayscale()
        .normalise()
        .toBuffer(),

    // Strategy 2: High Contrast (Sharpen + Threshold)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2500, withoutEnlargement: false })
        .grayscale()
        .sharpen({ sigma: 1.5 })
        .threshold(140) // Slightly higher threshold
        .toBuffer(),

    // Strategy 3: Denoise + Contrast (Median + Modulate)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2500, withoutEnlargement: false })
        .grayscale()
        .median(1) // Reduce noise
        .linear(1.5, -30) // Boost contrast using linear transformation
        .sharpen()
        .toBuffer(),

    // Strategy 4: Gamma Correction (For dark/shadowed images)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2500, withoutEnlargement: false })
        .grayscale()
        .gamma(2.0)
        .normalise()
        .toBuffer(),

    // Strategy 5: Inverted (White text on dark background)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2500, withoutEnlargement: false })
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
        tessedit_pageseg_mode: "3", // PSM 3: Fully automatic page segmentation, but no OSD.
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


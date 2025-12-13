import sharp from "sharp";
import Tesseract from "tesseract.js";
import { Buffer } from "buffer";

export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: unknown;
}

/**
 * Enhanced OCR preprocessing for medicine labels/strips.
 * - Upscale for better character recognition (simulates higher DPI)
 * - Grayscale + high contrast for clearer text edges
 * - Adaptive thresholding simulation via normalize + modulate
 * - Multiple Tesseract hints for label-style text
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  // Step 1: Enhanced preprocessing pipeline
  const preprocessed = await sharp(buffer)
    .rotate() // Respect EXIF orientation
    .resize({ width: 3000, withoutEnlargement: false }) // Higher resolution for better detail
    .grayscale()
    .linear(1.5, -0.2) // Increase contrast (slope, intercept)
    .sharpen({
      sigma: 2,
      m1: 0,
      m2: 3,
      x1: 2,
      y2: 10,
      y3: 20,
    }) // Advanced sharpening
    .threshold(160) // Higher threshold for cleaner binarization
    .toBuffer();

  // Step 2: Run Tesseract with optimized settings for medicine labels
  const { data } = await Tesseract.recognize(preprocessed, "eng", {
    tessedit_pageseg_mode: "6", // PSM 6: Assume a single uniform block of text (better for dense lists)
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,%-/()[]: ", // Added [] and :
    preserve_interword_spaces: "1",
    tessjs_create_hocr: "0",
    tessjs_create_tsv: "0",
  } as any);

  return {
    text: data.text ?? "",
    confidence:
      typeof (data as any).confidence === "number" ? (data as any).confidence : undefined,
    raw: data as unknown,
  };
}


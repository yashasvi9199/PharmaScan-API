import sharp from "sharp";
import Tesseract from "tesseract.js";

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
    .resize({ width: 2500, withoutEnlargement: false }) // Upscale small images
    .grayscale()
    .normalise({ lower: 2, upper: 98 }) // Stretch contrast, clip outliers
    .modulate({ brightness: 1.1 }) // Slight brightness boost
    .sharpen({ sigma: 1.5 }) // Stronger sharpening for text edges
    .median(1) // Reduce noise while preserving edges
    .threshold(140) // Binarize for cleaner text (adjust based on testing)
    .toBuffer();

  // Step 2: Run Tesseract with optimized settings for medicine labels
  // PSM 4: Assume a single column of text of variable sizes (common on strips)
  // PSM 11: Sparse text - find as much text as possible in no particular order
  // Using PSM 4 as primary for structured label content
  const { data } = await Tesseract.recognize(preprocessed, "eng", {
    tessedit_pageseg_mode: "4", // Variable block sizes
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,%-/() ",
    preserve_interword_spaces: "1",
  } as any);

  return {
    text: data.text ?? "",
    confidence:
      typeof (data as any).confidence === "number" ? (data as any).confidence : undefined,
    raw: data as unknown,
  };
}


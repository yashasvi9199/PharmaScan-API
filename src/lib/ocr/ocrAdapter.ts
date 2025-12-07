import sharp from "sharp";
import Tesseract from "tesseract.js";

export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: unknown;
}

/**
 * Preprocess image buffer (resize, grayscale, sharpen, adaptive-ish threshold)
 * then run tesseract. Keeps changes minimal and works on typical phone photos.
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  // Preprocess: upscale to ~2000px wide, grayscale, normalize, slight sharpen
  const pre = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: 2000, withoutEnlargement: true })
    .grayscale()
    .normalise()
    .sharpen()
    .toBuffer();

  // Try page segmentation mode 6 (assume a single block of text)
  // This is a conservative starting point for labels/strips.
  const psm = 6;

  const { data } = await Tesseract.recognize(pre, "eng", {
    tessedit_pageseg_mode: psm,
  } as any); // Tesseract options typing can be loose here

  return {
    text: data.text ?? "",
    confidence:
      typeof (data as any).confidence === "number" ? (data as any).confidence : undefined,
    raw: data as unknown,
  };
}

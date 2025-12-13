import sharp from "sharp";
import { createWorker, PSM } from "tesseract.js";
import { Buffer } from "buffer";

export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: unknown;
  engine?: string;
}

// Common pharmaceutical terms to boost confidence
const PHARMA_TERMS = [
  "tablet", "capsule", "mg", "ml", "g", "mcg", "injection", "syrup", "suspension",
  "ip", "bp", "usp", "batch", "mfg", "exp", "mrp", "incl", "taxes",
  "store", "cool", "dry", "place", "dosage", "physician", "warning",
  "composition", "contains", "hydrochloride", "sodium", "potassium"
];

/**
 * Run OCR with advanced preprocessing and ensemble strategy.
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  // 1. Preprocess image with multiple strategies
  const strategies = [
    // Strategy 1: Standard High-Res
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
        .threshold(140)
        .toBuffer(),

    // Strategy 3: Denoise + Contrast
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2500, withoutEnlargement: false })
        .grayscale()
        .median(1)
        .linear(1.5, -30)
        .sharpen()
        .toBuffer(),
        
    // Strategy 4: Gamma Correction (for shadows)
    async (b: Buffer) =>
      sharp(b)
        .rotate()
        .resize({ width: 2500, withoutEnlargement: false })
        .grayscale()
        .gamma(2.0)
        .normalise()
        .toBuffer(),
  ];

  const results: OCRAdapterResult[] = [];
  
  // Create a worker once to reuse
  const worker = await createWorker("eng", 1, {
    logger: m => process.env.NODE_ENV === 'development' ? console.log(m) : null,
  });

  // Set advanced parameters for medicine labels
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO, // Auto PSM
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()%/mg-µ[] ",
    preserve_interword_spaces: "1",
    textord_min_linesize: "2.5",
  });

  // Run strategies in parallel (or sequential if memory constrained)
  // Sequential is safer for memory
  for (const [index, strategy] of strategies.entries()) {
    try {
      const processedBuffer = await strategy(buffer);
      const { data } = await worker.recognize(processedBuffer);
      
      // Calculate confidence boost based on pharma terms
      const text = data.text || "";
      const words = text.toLowerCase().split(/\W+/);
      const matchedTerms = words.filter(w => PHARMA_TERMS.includes(w));
      const termScore = Math.min((matchedTerms.length * 5), 20); // Up to 20 points boost
      
      const confidence = (data.confidence || 0) + termScore;

      results.push({
        text,
        confidence: Math.min(confidence, 99),
        raw: data,
        engine: `strategy-${index + 1}`
      });

      // Early exit if excellent result
      if (confidence > 90) break;
      
    } catch (err) {
      console.warn(`OCR Strategy ${index + 1} failed:`, err);
    }
  }

  await worker.terminate();

  if (results.length === 0) {
    return { text: "", confidence: 0 };
  }

  // Select best result by confidence
  const bestResult = results.reduce((prev, current) => 
    (current.confidence || 0) > (prev.confidence || 0) ? current : prev
  );

  return bestResult;
}

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
  "composition", "contains", "hydrochloride", "sodium", "potassium",
  "marketed", "manufactured", "india", "ltd", "pvt", "regd", "trade", "mark"
];

/**
 * Run OCR with robust preprocessing and sparse text mode.
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  // Strategies: Start with minimal processing to avoid destroying data
  const strategies = [
    // Strategy 1: Minimal Processing (Grayscale + PNG format)
    // Best for clean images where filters might hurt
    async (b: Buffer) =>
      sharp(b)
        .resize({ width: 1800, withoutEnlargement: true })
        .grayscale()
        .png()
        .toBuffer(),

    // Strategy 2: Standard Normalize (Good for lighting issues)
    async (b: Buffer) =>
      sharp(b)
        .resize({ width: 1800, withoutEnlargement: true })
        .grayscale()
        .normalise()
        .png()
        .toBuffer(),

    // Strategy 3: High Contrast (Sharpen + Threshold)
    // Best for faint text
    async (b: Buffer) =>
      sharp(b)
        .resize({ width: 1800, withoutEnlargement: true })
        .grayscale()
        .sharpen({ sigma: 1.5 })
        .threshold(140)
        .png()
        .toBuffer(),
  ];

  let bestResult: OCRAdapterResult = { text: "", confidence: 0 };
  
  // Initialize worker
  const worker = await createWorker("eng", 1, {
    logger: m => process.env.NODE_ENV === 'development' ? console.log(m) : null,
  });

  // Use PSM 11 (Sparse Text) - Critical for medicine strips which have scattered text
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()%/mg-µ[] ",
    preserve_interword_spaces: "1",
  });

  for (const [index, strategy] of strategies.entries()) {
    try {
      const processedBuffer = await strategy(buffer);
      const { data } = await worker.recognize(processedBuffer);
      
      const text = (data.text || "").trim();
      
      // Calculate score based on pharma terms
      const words = text.toLowerCase().split(/\W+/);
      const matchedTerms = words.filter(w => PHARMA_TERMS.includes(w));
      
      // Boost confidence significantly if we find pharma terms
      // This helps distinguish "good" text from "random noise"
      const termScore = Math.min((matchedTerms.length * 10), 40); 
      
      const rawConfidence = data.confidence || 0;
      const finalConfidence = Math.min(rawConfidence + termScore, 99);

      console.log(`[OCR Strategy ${index + 1}] Length: ${text.length}, Terms: ${matchedTerms.length}, RawConf: ${rawConfidence}, FinalConf: ${finalConfidence}`);

      // If this result is better, keep it
      // We prioritize results with more pharma terms even if raw confidence is slightly lower
      if (finalConfidence > (bestResult.confidence || 0)) {
        bestResult = {
          text,
          confidence: finalConfidence,
          raw: data,
          engine: `strategy-${index + 1}`
        };
      }

      // Early exit if we have a great result
      if (finalConfidence > 90 && text.length > 50) break;
      
    } catch (err) {
      console.warn(`OCR Strategy ${index + 1} failed:`, err);
    }
  }

  await worker.terminate();
  return bestResult;
}

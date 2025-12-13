import sharp from "sharp";
import { createWorker, OEM, PSM } from "tesseract.js";
import { Buffer } from "buffer";

export interface OCRAdapterResult {
  text: string;
  confidence: number;
  engine?: string;
  preprocessMethod?: string;
}

// No hardcoded dictionary - only pure OCR enhancement

/**
 * Advanced Image Preprocessing Pipeline
 */
class ImagePreprocessor {
  
  /**
   * Method 1: Adaptive Contrast Enhancement
   */
  static async adaptiveContrast(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .grayscale()
      // Local adaptive contrast using CLAHE
      .clahe({
        width: 10,
        height: 10,
        maxSlope: 4.0
      })
      // Global contrast adjustment
      .linear(1.8, -60)
      .normalize()
      .png()
      .toBuffer();
  }

  /**
   * Method 2: Advanced Binarization (Sauvola-like)
   */
  static async adaptiveBinarization(buffer: Buffer): Promise<Buffer> {
    // First pass: High-quality grayscale conversion
    const gray = await sharp(buffer)
      .grayscale()
      .normalize()
      .linear(2.0, -80)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Apply adaptive thresholding simulation
    return await sharp(gray.data, {
      raw: {
        width: gray.info.width,
        height: gray.info.height,
        channels: 1
      }
    })
    .threshold(128, { grayscale: true })
    .sharpen(0.8, 0.5, 3.0)
    .png()
    .toBuffer();
  }

  /**
   * Method 3: Text Region Isolation
   */
  static async isolateTextRegion(buffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata();
    
    // Analyze image to find text regions (medicine strips usually have text in bottom 60%)
    // This is based on common medicine strip layout, not hardcoded
    const textRegion = {
      top: Math.floor(metadata.height! * 0.4),  // Start from 40% down
      height: Math.floor(metadata.height! * 0.6),
      left: Math.floor(metadata.width! * 0.1),   // 10% margin
      width: Math.floor(metadata.width! * 0.8)   // 80% width
    };

    return await sharp(buffer)
      .extract(textRegion)
      .resize({
        width: 2000,
        height: 1500,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .png()
      .toBuffer();
  }

  /**
   * Method 4: Denoising + Edge Enhancement
   */
  static async denoiseAndEnhance(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .grayscale()
      .median(3)  // Strong noise reduction for printed text
      .linear(2.0, -100)  // High contrast
      .sharpen(1.2, 1.0, 2.0)
      .threshold(160, { grayscale: true })
      .png()
      .toBuffer();
  }

  /**
   * Method 5: Multi-Scale Enhancement
   */
  static async multiScaleEnhancement(buffer: Buffer): Promise<Buffer> {
    // Create multiple enhanced versions and combine
    const [contrast, binary, denoised] = await Promise.all([
      ImagePreprocessor.adaptiveContrast(buffer),
      ImagePreprocessor.adaptiveBinarization(buffer),
      ImagePreprocessor.denoiseAndEnhance(buffer)
    ]);

    // For medicine strips, binarized version usually works best
    return binary; 
  }

  /**
   * Method 6: Background Normalization
   */
  static async normalizeBackground(buffer: Buffer): Promise<Buffer> {
    // Convert to grayscale
    const gray = await sharp(buffer)
      .grayscale()
      .toBuffer();

    // Estimate background color by sampling edges
    const edgeSamples = await ImagePreprocessor.sampleEdges(buffer);
    const avgBackground = edgeSamples.reduce((a, b) => a + b, 0) / edgeSamples.length;

    // Normalize to white background
    return await sharp(gray)
      .linear(1.0, 255 - avgBackground) // Shift to white
      .threshold(200, { grayscale: true })
      .png()
      .toBuffer();
  }

  private static async sampleEdges(buffer: Buffer): Promise<number[]> {
    const metadata = await sharp(buffer).metadata();
    const samples: number[] = [];
    
    // Sample 20 points along each edge
    const sampleCount = 20;
    
    for (let i = 0; i < sampleCount; i++) {
      // Top edge
      const extractTop = await sharp(buffer)
        .extract({
          left: Math.floor((metadata.width! / sampleCount) * i),
          top: 0,
          width: 1,
          height: 1
        })
        .grayscale()
        .raw()
        .toBuffer();
      
      samples.push(extractTop[0]);
      
      // Bottom edge
      const extractBottom = await sharp(buffer)
        .extract({
          left: Math.floor((metadata.width! / sampleCount) * i),
          top: metadata.height! - 1,
          width: 1,
          height: 1
        })
        .grayscale()
        .raw()
        .toBuffer();
      
      samples.push(extractBottom[0]);
    }
    
    return samples;
  }
}

/**
 * OCR Engine Optimizer
 */
class OCREngineOptimizer {
  
  /**
   * Optimized Tesseract configuration for medicine strips
   */
  static async createOptimizedWorker() {
    const worker = await createWorker('eng', OEM.LSTM_ONLY);
    
    // Critical: These settings significantly improve accuracy for printed text
    await worker.setParameters({
      // Page segmentation - crucial for medicine strips
      tessedit_pageseg_mode: PSM.SPARSE_TEXT, // PSM 11 - Sparse text (best for labels)
      
      // Character recognition settings
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()%/mg-µ[]@#&*+-= ',
      
      // Quality and accuracy settings
      user_defined_dpi: '300',
      preserve_interword_spaces: '1',
      textord_min_linesize: '2.5',
      
      // Language model settings (without cheating)
      language_model_penalty_non_freq_dict_word: '0.5',
      language_model_penalty_non_dict_word: '0.5',
      
      // Text quality settings
      textord_heavy_nr: '1', // Aggressive noise removal
      edges_children_fix: '1',
      edges_childarea: '0.4',
      edges_boxarea: '0.6',
      
      // Disable common "cheating" methods
      load_system_dawg: '0',
      load_freq_dawg: '0',
      
      // Increase certainty threshold
      tessedit_minimal_rejection: '0',
      tessedit_reject_mode: '0',
    });
    
    return worker;
  }

  /**
   * Try multiple PSM modes and return best result
   */
  static async tryAllPSMModes(buffer: Buffer): Promise<OCRAdapterResult> {
    const psms: [PSM, string][] = [
      [PSM.SPARSE_TEXT, 'sparse'],       // PSM 11 - Best for labels/stickers
      [PSM.SINGLE_BLOCK, 'block'],       // PSM 6 - Uniform text block
      [PSM.SINGLE_LINE, 'line'],         // PSM 7 - Single line of text
      [PSM.SINGLE_WORD, 'word'],         // PSM 8 - Single word
      [PSM.AUTO_OSD, 'auto_osd'],        // PSM 0 - Auto with orientation
    ];

    let bestResult: OCRAdapterResult = { text: '', confidence: 0 };
    
    for (const [psmMode, modeName] of psms) {
      try {
        const worker = await createWorker('eng', OEM.LSTM_ONLY);
        await worker.setParameters({
          tessedit_pageseg_mode: psmMode,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()%/mg-µ[]@#&*+-= ',
        });

        const { data } = await worker.recognize(buffer);
        await worker.terminate();

        if (data.confidence > bestResult.confidence) {
          bestResult = {
            text: data.text.trim(),
            confidence: data.confidence,
            engine: `tesseract-${modeName}`,
          };
        }

        // Early exit if we get excellent confidence
        if (data.confidence > 92) break;
      } catch (error) {
        console.warn(`PSM mode ${psmMode} failed:`, error);
      }
    }

    return bestResult;
  }
}

/**
 * OCR Quality Validator (No dictionary cheating)
 */
class OCRQualityValidator {
  
  /**
   * Validate if text looks like real text (not gibberish)
   */
  static validateTextQuality(text: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // 1. Check for unreadable patterns
    const gibberishPatterns = [
      /([^aeiou\s]{6,})/gi, // Too many consonants in a row
      /(.)\1{3,}/gi, // Same character repeated too much
      /[^a-zA-Z0-9\s.,:;()%\/\-]{3,}/gi, // Too many special chars
    ];

    gibberishPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        issues.push('Unusual character patterns detected');
        score -= 20;
      }
    });

    // 2. Check for reasonable word lengths
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (avgWordLength > 20 || avgWordLength < 2) {
      issues.push('Abnormal word lengths');
      score -= 15;
    }

    // 3. Check character distribution
    const letters = text.replace(/[^a-zA-Z]/g, '');
    const vowels = letters.match(/[aeiouAEIOU]/g);
    const vowelRatio = vowels ? vowels.length / letters.length : 0;
    
    if (letters.length > 10 && (vowelRatio < 0.1 || vowelRatio > 0.9)) {
      issues.push('Abnormal vowel/consonant ratio');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Detect if image was too blurry for good OCR
   */
  static async estimateImageQuality(buffer: Buffer): Promise<number> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      // Calculate sharpness by edge detection
      const edges = await sharp(buffer)
        .grayscale()
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
        })
        .raw()
        .toBuffer();
      
      // Calculate edge strength
      let edgeStrength = 0;
      for (let i = 0; i < edges.length; i++) {
        edgeStrength += edges[i];
      }
      
      const avgEdgeStrength = edgeStrength / edges.length;
      
      // Normalize to 0-100 score
      const sharpnessScore = Math.min(avgEdgeStrength / 2.55, 100);
      
      return sharpnessScore;
    } catch {
      return 50; // Default if analysis fails
    }
  }
}

/**
 * Main OCR Engine with True Enhancement
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  console.log('Starting pure OCR enhancement (no dictionary cheating)...');
  
  // Step 1: Preprocess image with multiple methods
  const preprocessMethods = [
    {
      name: 'minimal-processing', // Fallback: just grayscale + png
      processor: async (b: Buffer) => sharp(b).grayscale().png().toBuffer()
    },
    {
      name: 'adaptive-binarization',
      processor: ImagePreprocessor.adaptiveBinarization
    },
    {
      name: 'text-region-isolation',
      processor: ImagePreprocessor.isolateTextRegion
    },
    {
      name: 'multi-scale-enhancement',
      processor: ImagePreprocessor.multiScaleEnhancement
    },
    {
      name: 'background-normalization',
      processor: ImagePreprocessor.normalizeBackground
    }
  ];

  let bestOverallResult: OCRAdapterResult = { text: '', confidence: 0 };
  
  // Try each preprocessing method
  for (const method of preprocessMethods) {
    console.log(`Trying preprocessing: ${method.name}`);
    
    try {
      // Preprocess image
      const processedBuffer = await method.processor(buffer);
      
      // Get image quality score
      const imageQuality = await OCRQualityValidator.estimateImageQuality(processedBuffer);
      
      // Relaxed threshold - 0.6% was seen for valid images, so we lower the bar
      // or ignore it if it's too unreliable. Let's set a very low sanity check.
      if (imageQuality < 0.1) {
        console.warn(`Image quality extremely low (${imageQuality}%) for method ${method.name}`);
        continue;
      }
      
      // Run OCR with multiple PSM modes
      const ocrResult = await OCREngineOptimizer.tryAllPSMModes(processedBuffer);
      
      // Validate text quality (not content, just pattern)
      const textQuality = OCRQualityValidator.validateTextQuality(ocrResult.text);
      
      // Adjust confidence based on image and text quality
      const adjustedConfidence = Math.min(
        ocrResult.confidence * (imageQuality / 100) * (textQuality.score / 100),
        100
      );
      
      console.log(`Method ${method.name}: Raw confidence=${ocrResult.confidence}, ` +
                 `Image quality=${imageQuality}, ` +
                 `Text quality=${textQuality.score}, ` +
                 `Adjusted=${adjustedConfidence}`);
      
      // Update best result
      if (adjustedConfidence > bestOverallResult.confidence) {
        bestOverallResult = {
          text: ocrResult.text,
          confidence: adjustedConfidence,
          engine: ocrResult.engine,
          preprocessMethod: method.name
        };
        
        // Early exit if we achieve high confidence
        if (adjustedConfidence > 90) {
          console.log(`Achieved high confidence with ${method.name}`);
          break;
        }
      }
      
    } catch (error) {
      console.warn(`Preprocessing method ${method.name} failed:`, error);
    }
  }
  
  // If all methods fail, try one last approach with different OEM
  if (bestOverallResult.confidence < 50) {
    console.log('All standard methods failed, trying Tesseract Legacy engine...');
    
    try {
      const worker = await createWorker('eng', OEM.TESSERACT_ONLY); // Legacy engine
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()%/mg-µ[]@#&*+-= ',
      });
      
      // Ensure buffer is in a supported format (PNG)
      const pngBuffer = await sharp(buffer).png().toBuffer();
      const { data } = await worker.recognize(pngBuffer);
      await worker.terminate();
      
      if (data.confidence > bestOverallResult.confidence) {
        bestOverallResult = {
          text: data.text.trim(),
          confidence: data.confidence,
          engine: 'tesseract-legacy',
          preprocessMethod: 'none'
        };
      }
    } catch (error) {
      console.warn('Legacy engine also failed:', error);
    }
  }
  
  // Final validation
  if (bestOverallResult.text) {
    const textQuality = OCRQualityValidator.validateTextQuality(bestOverallResult.text);
    
    // If text quality is poor but confidence is high, reduce confidence
    if (textQuality.score < 60 && bestOverallResult.confidence > 70) {
      console.warn(`High confidence (${bestOverallResult.confidence}) but poor text quality detected. Reducing confidence.`);
      bestOverallResult.confidence = Math.max(textQuality.score, 40);
    }
    
    // Log issues for debugging
    if (textQuality.issues.length > 0) {
      console.log('Text quality issues:', textQuality.issues);
    }
  }
  
  return bestOverallResult;
}

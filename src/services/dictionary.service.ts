import Fuse from "fuse.js";

interface DictionaryItem {
  slug: string;
  canonical: string;
  names: string[];
  atc: string | null;
}

const DICTIONARY_URL = "https://yashasvi9199.github.io/PharmaScan-Dictionary/dictionary.bundle.json";
let dictionaryCache: DictionaryItem[] | null = null;
let fuse: Fuse<DictionaryItem> | null = null;

// Common words found on medicine packaging that should NOT match drugs
const STOPWORDS = new Set([
  // General label text
  "tablet", "tablets", "capsule", "capsules", "syrup", "injection", "cream", "gel",
  "ointment", "drops", "solution", "suspension", "powder", "patch", "spray",
  // Dosage & usage
  "dosage", "dose", "daily", "twice", "thrice", "times", "before", "after", "meals",
  "morning", "evening", "night", "hours", "days", "weeks", "months", "oral", "topical",
  // Warnings & instructions
  "warning", "warnings", "caution", "keep", "away", "children", "store", "cool",
  "place", "protect", "light", "moisture", "shake", "well", "before", "use",
  "consult", "doctor", "physician", "pharmacist", "pregnant", "nursing", "allergic",
  "side", "effects", "discontinue", "occurs", "seek", "medical", "advice", "immediately",
  // Manufacturing
  "manufactured", "marketed", "distributed", "india", "limited", "pvt", "ltd",
  "batch", "mfg", "exp", "date", "price", "mrp", "inclusive", "taxes", "pack",
  // Common non-drug words
  "each", "film", "coated", "contains", "active", "inactive", "ingredients",
  "excipients", "listed", "below", "schedule", "prescription", "only", "medicine",
  "drug", "pharmaceutical", "formulation", "composition", "strength", "storage",
  "this", "that", "with", "from", "have", "been", "will", "would", "could", "should",
  "take", "taken", "taking", "used", "using", "treatment", "treat", "therapy",
  // Units
  "mg", "mcg", "ml", "gm", "kg", "iu", "unit", "units",
]);

// Minimum length for a token to be considered (drug names are usually 4+ chars)
const MIN_TOKEN_LENGTH = 5;

// Fuse.js score threshold (0 = perfect, lower = stricter)
const FUSE_THRESHOLD = 0.1;

// Minimum confidence to include in results (0-1 scale)
const MIN_CONFIDENCE = 0.85;

export async function loadDictionary(): Promise<DictionaryItem[]> {
  if (dictionaryCache) return dictionaryCache;
  try {
    console.log("Fetching dictionary from GitHub Pages...");
    const res = await fetch(DICTIONARY_URL);
    if (!res.ok) throw new Error(`Failed to fetch dictionary: ${res.statusText}`);
    dictionaryCache = (await res.json()) as DictionaryItem[];
    
    // Initialize Fuse with stricter settings
    fuse = new Fuse(dictionaryCache, {
      keys: [
        { name: "canonical", weight: 2 }, // Prioritize canonical name
        { name: "names", weight: 1 },
      ],
      includeScore: true,
      threshold: FUSE_THRESHOLD, // Very strict matching
      ignoreLocation: true,
      minMatchCharLength: 4,
      findAllMatches: false,
      shouldSort: true,
    });

    console.log(`Dictionary loaded successfully: ${dictionaryCache.length} items`);
    return dictionaryCache;
  } catch (err) {
    console.error("Error loading dictionary:", err);
    return [];
  }
}

/**
 * Detect drugs/salts from OCR text.
 * Uses strict matching to minimize false positives.
 */
export async function detectDrugs(text: string) {
  await loadDictionary();
  if (!fuse) return [];

  // Clean text: keep only alphanumeric + spaces, lowercase
  const cleanText = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // Split into tokens, filter short words and stopwords
  const tokens = cleanText
    .split(" ")
    .filter(t => t.length >= MIN_TOKEN_LENGTH)
    .filter(t => !STOPWORDS.has(t));

  // Generate bigrams and trigrams for multi-word drug names
  const ngrams: string[] = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  for (let i = 0; i < tokens.length - 2; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }

  const results = new Map<string, {
    slug: string;
    name: string;
    confidence: number;
    atc: string | null;
    matchedToken: string;
  }>();

  for (const candidate of ngrams) {
    const searchResults = fuse.search(candidate);
    
    if (searchResults.length > 0) {
      const best = searchResults[0];
      
      // Only accept very close matches
      if (best.score !== undefined && best.score <= FUSE_THRESHOLD) {
        const confidence = parseFloat((1 - best.score).toFixed(3));
        
        // Skip low confidence matches
        if (confidence < MIN_CONFIDENCE) continue;
        
        // Skip if it's a generic category (no specific ATC code or very short ATC)
        // Real drugs have ATC codes like A01AA01, categories are like A or A01
        const atc = best.item.atc;
        const isCategory = !atc || atc.length < 5;
        
        // Prefer drugs with full ATC codes
        const existing = results.get(best.item.slug);
        const shouldReplace = !existing || 
          confidence > existing.confidence ||
          (!existing.atc && atc && atc.length >= 5);
        
        if (shouldReplace && !isCategory) {
          results.set(best.item.slug, {
            slug: best.item.slug,
            name: best.item.canonical,
            confidence,
            atc,
            matchedToken: candidate,
          });
        }
      }
    }
  }

  // Sort by confidence descending
  const detected = Array.from(results.values())
    .sort((a, b) => b.confidence - a.confidence)
    .map(({ slug, name, confidence, atc }) => ({ slug, name, confidence, atc }));

  console.log(`Drug detection: ${tokens.length} tokens → ${detected.length} drugs found`);
  
  return detected;
}

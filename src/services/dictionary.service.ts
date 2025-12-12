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

export async function loadDictionary(): Promise<DictionaryItem[]> {
  if (dictionaryCache) return dictionaryCache;
  try {
    console.log("Fetching dictionary from GitHub Pages...");
    const res = await fetch(DICTIONARY_URL);
    if (!res.ok) throw new Error(`Failed to fetch dictionary: ${res.statusText}`);
    dictionaryCache = (await res.json()) as DictionaryItem[];
    
    // Initialize Fuse
    fuse = new Fuse(dictionaryCache, {
      keys: ["names", "canonical"],
      includeScore: true,
      threshold: 0.2, // Lower is stricter (0.0 = exact, 1.0 = match anything)
      ignoreLocation: true,
    });

    console.log(`Dictionary loaded successfully: ${dictionaryCache.length} items`);
    return dictionaryCache;
  } catch (err) {
    console.error("Error loading dictionary:", err);
    return [];
  }
}

export async function detectDrugs(text: string) {
  await loadDictionary();
  if (!fuse) return [];

  // Clean text and split into tokens
  const cleanText = text.replace(/[^\w\s]/g, " ").toLowerCase();
  const tokens = cleanText.split(/\s+/).filter(t => t.length > 3);
  
  // Generate bigrams for multi-word drugs
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }

  const candidates = [...tokens, ...bigrams];
  const results = new Map<string, any>();

  for (const cand of candidates) {
    const searchRes = fuse.search(cand);
    if (searchRes.length > 0) {
      const best = searchRes[0];
      // Fuse score: 0 is perfect, 1 is mismatch. 
      // We accept matches with score < 0.2 (very close)
      if (best.score !== undefined && best.score < 0.2) {
        // Use higher confidence if we already found this drug
        const existing = results.get(best.item.slug);
        const confidence = 1 - best.score;
        
        if (!existing || confidence > existing.confidence) {
          results.set(best.item.slug, {
            slug: best.item.slug,
            name: best.item.canonical,
            confidence: parseFloat(confidence.toFixed(2)),
            atc: best.item.atc,
          });
        }
      }
    }
  }

  return Array.from(results.values());
}


import Fuse from "fuse.js";

interface DictionaryItem {
  slug: string;
  canonical: string;
  names: string[];
  atc: string | null;
}

interface ATCCategory {
  code: string;
  name: string;
  level: number;
}

const DICTIONARY_URL = "https://yashasvi9199.github.io/PharmaScan-Dictionary/dictionary.bundle.json";
let dictionaryCache: DictionaryItem[] | null = null;
let fuse: Fuse<DictionaryItem> | null = null;

// ATC Level 1 categories (anatomical main groups)
const ATC_MAIN_GROUPS: ATCCategory[] = [
  { code: "A", name: "Alimentary tract and metabolism", level: 1 },
  { code: "B", name: "Blood and blood forming organs", level: 1 },
  { code: "C", name: "Cardiovascular system", level: 1 },
  { code: "D", name: "Dermatologicals", level: 1 },
  { code: "G", name: "Genito-urinary system and sex hormones", level: 1 },
  { code: "H", name: "Systemic hormonal preparations", level: 1 },
  { code: "J", name: "Antiinfectives for systemic use", level: 1 },
  { code: "L", name: "Antineoplastic and immunomodulating agents", level: 1 },
  { code: "M", name: "Musculo-skeletal system", level: 1 },
  { code: "N", name: "Nervous system", level: 1 },
  { code: "P", name: "Antiparasitic products", level: 1 },
  { code: "R", name: "Respiratory system", level: 1 },
  { code: "S", name: "Sensory organs", level: 1 },
  { code: "V", name: "Various", level: 1 },
];

async function loadDictionary(): Promise<DictionaryItem[]> {
  if (dictionaryCache) return dictionaryCache;
  
  try {
    console.log("Fetching dictionary for lookup service...");
    const res = await fetch(DICTIONARY_URL);
    if (!res.ok) throw new Error(`Failed to fetch dictionary: ${res.statusText}`);
    dictionaryCache = (await res.json()) as DictionaryItem[];
    
    // Initialize Fuse for flexible searching
    fuse = new Fuse(dictionaryCache, {
      keys: [
        { name: "canonical", weight: 2 },
        { name: "names", weight: 1 },
        { name: "slug", weight: 0.5 },
      ],
      includeScore: true,
      threshold: 0.3, // More lenient for user search
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
    
    console.log(`Dictionary loaded: ${dictionaryCache.length} items`);
    return dictionaryCache;
  } catch (err) {
    console.error("Error loading dictionary:", err);
    return [];
  }
}

export interface MedicineResult {
  slug: string;
  name: string;
  alternateNames: string[];
  atc: string | null;
  atcCategory?: string;
  confidence?: number;
}

/**
 * Search medicines by query string.
 */
export async function searchMedicines(query: string, limit = 20): Promise<MedicineResult[]> {
  await loadDictionary();
  if (!fuse) return [];
  
  const results = fuse.search(query, { limit });
  
  return results.map((result) => ({
    slug: result.item.slug,
    name: result.item.canonical,
    alternateNames: result.item.names.filter(n => n !== result.item.canonical),
    atc: result.item.atc,
    atcCategory: result.item.atc ? getATCCategoryName(result.item.atc) : undefined,
    confidence: result.score !== undefined ? parseFloat((1 - result.score).toFixed(3)) : undefined,
  }));
}

/**
 * Get a specific medicine by its slug.
 */
export async function getMedicineBySlug(slug: string): Promise<MedicineResult | null> {
  await loadDictionary();
  if (!dictionaryCache) return null;
  
  const item = dictionaryCache.find(d => d.slug === slug);
  if (!item) return null;
  
  return {
    slug: item.slug,
    name: item.canonical,
    alternateNames: item.names.filter(n => n !== item.canonical),
    atc: item.atc,
    atcCategory: item.atc ? getATCCategoryName(item.atc) : undefined,
  };
}

/**
 * Get ATC main categories.
 */
export async function getATCCategories(): Promise<ATCCategory[]> {
  return ATC_MAIN_GROUPS;
}

/**
 * Get ATC category name from code.
 */
function getATCCategoryName(atcCode: string): string | undefined {
  if (!atcCode || atcCode.length < 1) return undefined;
  const mainGroup = ATC_MAIN_GROUPS.find(g => atcCode.startsWith(g.code));
  return mainGroup?.name;
}

/**
 * Get medicines by ATC category.
 */
export async function getMedicinesByCategory(atcPrefix: string, limit = 50): Promise<MedicineResult[]> {
  await loadDictionary();
  if (!dictionaryCache) return [];
  
  const filtered = dictionaryCache
    .filter(d => d.atc && d.atc.startsWith(atcPrefix))
    .slice(0, limit);
  
  return filtered.map(item => ({
    slug: item.slug,
    name: item.canonical,
    alternateNames: item.names.filter(n => n !== item.canonical),
    atc: item.atc,
    atcCategory: item.atc ? getATCCategoryName(item.atc) : undefined,
  }));
}

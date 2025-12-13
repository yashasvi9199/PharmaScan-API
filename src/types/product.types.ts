// src/types/product.types.ts
// Product/Medicine related types

export interface Product {
  id: string;
  name: string;
  slug: string;
  genericName?: string;
  manufacturer?: string;
  atc?: string | null;
  dosageForm?: string;
  strength?: string;
  packSize?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSearchResult {
  slug: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  atc?: string | null;
  confidence?: number;
}

export interface DrugMatch {
  slug: string;
  name: string;
  confidence: number;
  atc?: string | null;
  matchedToken?: string;
}

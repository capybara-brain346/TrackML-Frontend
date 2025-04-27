export interface Model {
  id: number;
  name: string;
  description: string;
  metrics: ModelMetrics;
  created_at: string;
  updated_at: string;
}

export interface ModelMetrics {
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  [key: string]: number | undefined;
}

export interface ModelEntry {
  id: number;
  name: string;
  developer?: string;
  model_type?: string;
  status?: string;
  date_interacted?: string;
  tags: string[];
  notes?: string;
  source_links: string[];
  parameters?: number;
  license?: string;
  version?: string;
}

export type ModelStatus = "Tried" | "Studying" | "Wishlist" | "Archived";
export type ModelType = "LLM" | "Vision" | "Audio" | "MultiModal" | "Other";

// Base types for database entities
export interface BaseEntity {
  id: string; // UUID
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ModelMetric extends BaseEntity {
  model_id: string;
  metric_name: string;
  metric_value: number;
}

export interface SourceLink extends BaseEntity {
  model_id: string;
  url: string;
}

export interface Tag extends BaseEntity {
  name: string;
}

export interface ModelEntry extends BaseEntity {
  user_id: string;
  name: string;
  model_type?: ModelType;
  status?: ModelStatus;
  developer?: string;
  date_interacted?: string;
  notes?: string;
  parameters?: number;
  license?: string;
  version?: string;
  tags: string[];
  source_links: string[];
  metrics?: ModelMetric[];
}

export type ModelStatus = "Tried" | "Studying" | "Wishlist" | "Archived";
export type ModelType = "LLM" | "Vision" | "Audio" | "MultiModal" | "Other";

export interface SearchParams {
  q?: string;
  type?: ModelType;
  status?: ModelStatus;
  tag?: string;
  date_interacted?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AutofillRequest {
  source: "huggingface" | "github";
  identifier: string;
}

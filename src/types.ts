export type ModelType = "LLM" | "Vision" | "Audio" | "MultiModal" | "Other";
export type ModelStatus = "Tried" | "Studying" | "Wishlist" | "Archived";

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  workspaces: WorkspaceEntry[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ModelEntry {
  id: number;
  name: string;
  developer?: string;
  model_type?: ModelType;
  status?: ModelStatus;
  date_interacted?: string;
  tags?: string[];
  notes?: string;
  source_links?: string[];
  parameters?: number;
  license?: string;
  version?: string;
  user_id?: number;
  workspace_id?: number;
  username?: string;
}

export interface WorkspaceEntry {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  is_default: boolean;
  user_id: number;
  models: ModelEntry[];
}

export interface ModelInsightResponse {
  comparative_analysis: string;
}

export interface SearchParams {
  q?: string;
  type?: ModelType;
  status?: ModelStatus;
  tag?: string;
  workspace_id?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
  error?: string;
  metadata?: any;
}

export interface ModelInsights {
  insights: string;
}

export interface ComparativeAnalysis {
  comparative_analysis: string;
}

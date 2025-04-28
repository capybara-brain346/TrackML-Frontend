import axios from "axios";
import {
  ModelEntry,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ModelMetric,
  SourceLink,
  SearchParams,
  AutofillRequest,
} from "../types";

const API_BASE_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    localStorage.setItem("auth_token", response.data.token);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<AuthResponse>("/auth/verify-token");
    return response.data;
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    localStorage.setItem("auth_token", response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("auth_token");
  },

  updateUser: async (id: number, data: Partial<RegisterCredentials>) => {
    const response = await api.put<AuthResponse>(`/auth/user/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await api.delete(`/auth/user/${id}`);
    localStorage.removeItem("auth_token");
  },
};

export const modelApi = {
  getAll: async () => {
    const response = await api.get<ModelEntry[]>("/models");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ModelEntry>(`/models/${id}`);
    return response.data;
  },

  create: async (
    model: Omit<ModelEntry, "id" | "created_at" | "updated_at">
  ) => {
    // Remove user_id from request body as it's handled by backend auth
    const { user_id, ...modelData } = model;
    const response = await api.post<ModelEntry>("/models", {
      ...modelData,
      // Backend expects ISO string for date
      date_interacted: model.date_interacted
        ? new Date(model.date_interacted).toISOString()
        : undefined,
    });
    return response.data;
  },

  update: async (id: number, model: Partial<ModelEntry>) => {
    // Remove user_id from request body as it's handled by backend auth
    const { user_id, ...modelData } = model;
    const response = await api.put<ModelEntry>(`/models/${id}`, {
      ...modelData,
      date_interacted: model.date_interacted
        ? new Date(model.date_interacted).toISOString()
        : undefined,
    });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/models/${id}`);
  },

  search: async (params: SearchParams) => {
    // Convert to URLSearchParams to properly encode query parameters
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q);
    if (params.type) searchParams.append("type", params.type);
    if (params.status) searchParams.append("status", params.status);
    if (params.tag) searchParams.append("tag", params.tag);
    if (params.date_interacted) {
      searchParams.append(
        "date_interacted",
        new Date(params.date_interacted).toISOString()
      );
    }

    const response = await api.get<ModelEntry[]>(
      `/models/search?${searchParams}`
    );
    return response.data;
  },

  autofill: async (data: AutofillRequest) => {
    const response = await api.post<Partial<ModelEntry>>(
      "/models/autofill",
      data
    );
    return response.data;
  },

  // Remove individual metric and source link management as they're not in backend
  // Will be handled through main model updates instead
};

export interface ModelInsights {
  technical_analysis: string;
  use_cases: string;
  recommendations: string;
}

export interface ComparativeAnalysis {
  comparative_analysis: string;
}

export const modelInsightApi = {
  getInsights: async (id: number): Promise<ModelInsights> => {
    const response = await api.get<ModelInsights>(`/models/${id}/insights`);
    return response.data;
  },

  compareModels: async (modelIds: number[]): Promise<ComparativeAnalysis> => {
    const response = await api.post<ComparativeAnalysis>(
      "/models/insights/compare",
      {
        model_ids: modelIds,
      }
    );
    return response.data;
  },
};

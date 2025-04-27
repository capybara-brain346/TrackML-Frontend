import axios from "axios";
import {
  ModelEntry,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ModelMetric,
  SourceLink,
  SearchParams,
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
    const response = await api.post<ModelEntry>("/models", {
      ...model,
      date_interacted: model.date_interacted
        ? new Date(model.date_interacted).toISOString()
        : undefined,
    });
    return response.data;
  },

  update: async (id: number, model: Partial<ModelEntry>) => {
    const response = await api.put<ModelEntry>(`/models/${id}`, {
      ...model,
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
    const response = await api.get<ModelEntry[]>("/models/search", {
      params: {
        ...params,
        date_interacted: params.date_interacted
          ? new Date(params.date_interacted).toISOString()
          : undefined,
      },
    });
    return response.data;
  },

  autofill: async (modelId: number, modelLinks?: string[]) => {
    const response = await api.post<Partial<ModelEntry>>("/models/autofill", {
      model_id: modelId,
      model_links: modelLinks || [],
    });
    return response.data;
  },

  // New endpoints for metrics and source links
  getMetrics: async (modelId: number) => {
    const response = await api.get<ModelMetric[]>(`/models/${modelId}/metrics`);
    return response.data;
  },

  addMetric: async (
    modelId: number,
    metric: Omit<ModelMetric, "id" | "model_id" | "created_at" | "updated_at">
  ) => {
    const response = await api.post<ModelMetric>(
      `/models/${modelId}/metrics`,
      metric
    );
    return response.data;
  },

  addSourceLink: async (modelId: number, url: string) => {
    const response = await api.post<SourceLink>(
      `/models/${modelId}/source-links`,
      {
        url,
      }
    );
    return response.data;
  },

  deleteSourceLink: async (modelId: number, linkId: number) => {
    await api.delete(`/models/${modelId}/source-links/${linkId}`);
  },
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

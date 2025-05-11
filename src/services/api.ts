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

interface ApiResponse<T> {
  data: T;
  message: string;
  metadata: any | null;
  statusCode: number;
  success: boolean;
  timestamp: string;
}

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
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    localStorage.setItem("auth_token", response.data.data.token);
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<AuthResponse>>(
      "/auth/verify-token"
    );
    return response.data.data;
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      credentials
    );
    localStorage.setItem("auth_token", response.data.data.token);
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem("auth_token");
  },

  updateUser: async (id: number, data: Partial<RegisterCredentials>) => {
    const response = await api.put<ApiResponse<AuthResponse>>(
      `/auth/user/${id}`,
      data
    );
    return response.data.data;
  },

  deleteUser: async (id: number) => {
    await api.delete(`/auth/user/${id}`);
    localStorage.removeItem("auth_token");
  },
};

export const modelApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<ModelEntry[]>>("/models");
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<ModelEntry>>(`/models/${id}`);
    return response.data.data;
  },

  create: async (
    model: Omit<ModelEntry, "id" | "created_at" | "updated_at">
  ) => {
    const response = await api.post<ApiResponse<ModelEntry>>("/models", {
      ...model,
      date_interacted: model.date_interacted
        ? new Date(model.date_interacted).toISOString()
        : undefined,
    });
    return response.data.data;
  },

  update: async (id: number, model: Partial<ModelEntry>) => {
    const response = await api.put<ApiResponse<ModelEntry>>(`/models/${id}`, {
      ...model,
      date_interacted: model.date_interacted
        ? new Date(model.date_interacted).toISOString()
        : undefined,
    });
    return response.data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/models/${id}`);
  },

  search: async (params: SearchParams) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q);
    if (params.type) searchParams.append("type", params.type);
    if (params.status) searchParams.append("status", params.status);
    if (params.tag) searchParams.append("tag", params.tag);

    const response = await api.get<ApiResponse<ModelEntry[]>>(
      `/models/search?${searchParams}`
    );
    return response.data.data;
  },

  semanticSearch: async (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);
    const response = await api.get<
      ApiResponse<(ModelEntry & { relevance_score: number })[]>
    >(`/models/semantic-search?${searchParams}`);
    return response.data.data;
  },

  autofill: async (modelId: string, modelLinks?: string[], files?: File[]) => {
    const formData = new FormData();
    formData.append("model_id", modelId);

    if (modelLinks?.length) {
      modelLinks.forEach((link) => {
        formData.append("model_links[]", link);
      });
    }
    if (files?.length) {
      files.forEach((file) => {
        formData.append("files[]", file);
      });
    }

    const response = await api.post<
      ApiResponse<{
        response: string;
      }>
    >("/models/autofill", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Autofill failed");
    }

    try {
      const modelData = JSON.parse(
        response.data.data.response
      ) as Partial<ModelEntry>;
      return modelData;
    } catch (err) {
      return {
        notes: response.data.data.response,
      };
    }
  },
};

export interface ModelInsights {
  insights: string;
}

export interface ComparativeAnalysis {
  analysis: string;
}

export const modelInsightApi = {
  getInsights: async (id: number): Promise<ModelInsights> => {
    const response = await api.get<ApiResponse<ModelInsights>>(
      `/models/${id}/insights`
    );
    return response.data.data;
  },

  compareModels: async (modelIds: number[]): Promise<ComparativeAnalysis> => {
    const response = await api.post<ApiResponse<ComparativeAnalysis>>(
      "/models/insights/compare",
      {
        model_ids: modelIds,
      }
    );
    return response.data.data;
  },
};

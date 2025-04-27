import axios from "axios";
import { ModelEntry } from "../types";

const API_BASE_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const modelApi = {
  getAll: async () => {
    const response = await api.get<ModelEntry[]>("/");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ModelEntry>(`/${id}`);
    return response.data;
  },

  create: async (model: Omit<ModelEntry, "id">) => {
    const response = await api.post<ModelEntry>("/", model);
    return response.data;
  },

  update: async (id: number, model: Partial<ModelEntry>) => {
    const response = await api.put<ModelEntry>(`/${id}`, model);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/${id}`);
  },

  search: async (params: {
    q?: string;
    type?: string;
    status?: string;
    tag?: string;
  }) => {
    const response = await api.get<ModelEntry[]>("/search", { params });
    return response.data;
  },

  autofill: async (source: "huggingface" | "github", identifier: string) => {
    const response = await api.post<Partial<ModelEntry>>("/autofill", {
      source,
      identifier,
    });
    return response.data;
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

export const getModelInsights = async (id: number): Promise<ModelInsights> => {
  const response = await fetch(`${API_BASE_URL}/${id}/insights`);
  if (!response.ok) {
    throw new Error("Failed to fetch model insights");
  }
  return response.json();
};

export const compareModels = async (
  modelIds: number[]
): Promise<ComparativeAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/insights/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model_ids: modelIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to compare models");
  }
  return response.json();
};

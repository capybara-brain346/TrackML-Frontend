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
    const response = await api.put<ModelEntry>(`/${id}`, {
      ...model,
      date_interacted: model.date_interacted
        ? new Date(model.date_interacted).toISOString()
        : undefined,
    });
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
    date_interacted?: string;
  }) => {
    const response = await api.get<ModelEntry[]>("/search", {
      params: {
        ...params,
        date_interacted: params.date_interacted
          ? new Date(params.date_interacted).toISOString()
          : undefined,
      },
    });
    return response.data;
  },

  autofill: async (
    source: "huggingface" | "github",
    identifier: string,
    modelLinks?: string[]
  ) => {
    const response = await api.post<Partial<ModelEntry>>("/autofill", {
      source,
      identifier,
      model_links: modelLinks || [],
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

export const modelInsightApi = {
  getInsights: async (id: number): Promise<ModelInsights> => {
    const response = await api.get<ModelInsights>(`/${id}/insights`);
    return response.data;
  },

  compareModels: async (modelIds: number[]): Promise<ComparativeAnalysis> => {
    const response = await api.post<ComparativeAnalysis>("/insights/compare", {
      model_ids: modelIds,
    });
    return response.data;
  },
};

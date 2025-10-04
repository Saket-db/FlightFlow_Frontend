export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
}

export interface DatasetMeta {
  total_flights: number;
  date_range: {
    start: string;
    end: string;
  };
  airports: string[];
  airlines: string[];
  from_top?: Record<string, number>;
  to_top?: Record<string, number>;
}

export interface SlotStats {
  slot_15?: string;
  flights: number;
  avg_dep_delay: number;
  p50_dep_delay: number;
  p90_dep_delay: number;
  is_green: boolean;
  slot_label: string;
}

export interface GreenWindow {
  flight_id: string;
  origin: string;
  destination: string;
  green_window_start: string;
  green_window_end: string;
  scheduled_time: string;
  status: 'within' | 'outside' | 'critical';
}

export interface TopRoute {
  route: string;
  flight_count: number;
  avg_delay: number;
  on_time_rate: number;
}

export interface TopAirline {
  airline: string;
  flights: number;
  avg_dep_delay: number;
  p90_dep_delay: number;
}

export interface CascadeRisk {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  affected_flights: number;
  estimated_delay: number;
  mitigation_suggestions: string[];
}

export interface CascadeMeta {
  total_aggregated_flights: number;
  counts: Record<string, number>;
  thresholds: { q90: number; q60: number };
  page: number;
  per_page: number;
}

export interface CascadeApiResponse {
  meta: CascadeMeta;
  records: any[];
}

export interface PredictionRequest {
  flight: string;
}

export interface PredictionResponse {
  flight: string;
  p50: number;
  p90: number;
  delay_probability: number;
  confidence: number;
  sample_size: number;
}

export interface WhatIfRequest {
  flight: string;
  minutes: number;
  slotMinutes?: number;
}

export interface WhatIfResponse {
  flight: string;
  minutes: number;
  queueing_burden_before: number;
  queueing_burden_after: number;
  delta: number;
  stats_before?: {
    total_wait: number;
    total_flights: number;
    avg_wait_per_flight: number;
    avg_wait_per_unique_flight?: number;
    median_wait_per_flight?: number;
    top_slots: { bucket: number; count: number; per_flight_wait: number; total_wait: number }[];
  };
  stats_after?: {
    total_wait: number;
    total_flights: number;
    avg_wait_per_flight: number;
    avg_wait_per_unique_flight?: number;
    median_wait_per_flight?: number;
    top_slots: { bucket: number; count: number; per_flight_wait: number; total_wait: number }[];
  };
}

export interface ChatRequest {
  message: string;
  context?: any;
}

export interface ChatResponse {
  response: string;
  data?: any;
  suggestions?: string[];
}

class ApiService {
  private baseURL = 'http://127.0.0.1:8000';

  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health Check
  async checkHealth(): Promise<ApiResponse<HealthCheck>> {
    return this.fetchWithErrorHandling<HealthCheck>('/health');
  }

  // Dataset Operations
  async getDatasetMeta(): Promise<ApiResponse<DatasetMeta>> {
    return this.fetchWithErrorHandling<DatasetMeta>('/dataset/meta');
  }

  async getFlights(): Promise<ApiResponse<{flights: string[]}>> {
    return this.fetchWithErrorHandling<{flights: string[]}>('/flights');
  }

  // Analysis Operations
  async getSlotStats(): Promise<ApiResponse<SlotStats[]>> {
    return this.fetchWithErrorHandling<SlotStats[]>('/analysis/slots');
  }

  async getGreenWindows(): Promise<ApiResponse<GreenWindow[]>> {
    return this.fetchWithErrorHandling<GreenWindow[]>('/analysis/green');
  }

  async getTopRoutes(): Promise<ApiResponse<TopRoute[]>> {
    return this.fetchWithErrorHandling<TopRoute[]>('/analysis/top_routes');
  }

  async getTopAirlines(): Promise<ApiResponse<TopAirline[]>> {
    return this.fetchWithErrorHandling<TopAirline[]>('/analysis/top_airlines');
  }

  async getCascadeRisk(): Promise<ApiResponse<CascadeRisk>> {
    return this.fetchWithErrorHandling<CascadeRisk>('/analysis/cascade');
  }

  // Cascade Risk Analysis
  async getCascadeAnalysis(params?: { risk?: string; page?: number; per_page?: number; flight?: string }): Promise<ApiResponse<CascadeApiResponse>> {
    const qs = [] as string[];
    if (params) {
      if (params.risk) qs.push(`risk_level=${encodeURIComponent(params.risk)}`);
      if (params.page) qs.push(`page=${params.page}`);
      if (params.per_page) qs.push(`per_page=${params.per_page}`);
      if (params.flight) qs.push(`flight=${encodeURIComponent(params.flight)}`);
    }
    const endpoint = `/analysis/cascade${qs.length ? '?' + qs.join('&') : ''}`;
    return this.fetchWithErrorHandling<CascadeApiResponse>(endpoint);
  }

  // Runway Configuration
  async getRunwayConfig(): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling<any>('/config/runway');
  }

  async updateRunwayConfig(config: any): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling<any>('/config/runway', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  // Prediction Operations
  async predictDelays(request: PredictionRequest): Promise<ApiResponse<PredictionResponse>> {
    return this.fetchWithErrorHandling<PredictionResponse>('/predict/quantiles', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async runWhatIfScenario(request: WhatIfRequest): Promise<ApiResponse<WhatIfResponse>> {
    return this.fetchWithErrorHandling<WhatIfResponse>('/whatif/shift', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }


  // Chat Interface
  async sendChatMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.fetchWithErrorHandling<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiService();
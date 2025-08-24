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
  total_slots: number;
  utilized_slots: number;
  utilization_rate: number;
  avg_queueing_burden: number;
  detailed_slots?: any[];
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
  flight_count: number;
  avg_delay: number;
  on_time_rate: number;
  performance_score: number;
}

export interface CascadeRisk {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  affected_flights: number;
  estimated_delay: number;
  mitigation_suggestions: string[];
}

export interface PredictionRequest {
  flight_id: string;
  origin: string;
  destination: string;
  scheduled_time: string;
}

export interface PredictionResponse {
  flight_id: string;
  delay_probability: number;
  predicted_delay: number;
  confidence: number;
  factors: string[];
}

export interface WhatIfRequest {
  scenario: string;
  time_shift: number;
  affected_flights: string[];
}

export interface WhatIfResponse {
  scenario_id: string;
  impact_summary: {
    total_affected: number;
    delay_change: number;
    burden_change: number;
  };
  detailed_results: any[];
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

  // Analysis Operations
  async getSlotStats(): Promise<ApiResponse<SlotStats>> {
    return this.fetchWithErrorHandling<SlotStats>('/analysis/slots');
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
  async getCascadeAnalysis(): Promise<ApiResponse<CascadeRisk>> {
    return this.fetchWithErrorHandling<CascadeRisk>('/analysis/cascade');
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

  // Configuration
  async updateRunwayConfig(config: any): Promise<ApiResponse<any>> {
    return this.fetchWithErrorHandling<any>('/config/runway', {
      method: 'POST',
      body: JSON.stringify(config),
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
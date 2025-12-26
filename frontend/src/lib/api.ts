const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('protrack_token');

    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API functions
export const authApi = {
  login: async (email: string, password: string, role: string) => {
    return apiClient.post<{ user: any; token: string }>('/auth/login', {
      email,
      password,
      role,
    });
  },

  signup: async (name: string, email: string, password: string, role: string) => {
    return apiClient.post<{ user: any; token: string }>('/auth/signup', {
      name,
      email,
      password,
      role,
    });
  },
};

// User API functions
export const userApi = {
  getProfile: async () => {
    return apiClient.get<{ user: any }>('/users/profile');
  },

  updateProfile: async (data: { name: string; designation: string }) => {
    return apiClient.put<{ user: any }>('/users/profile', data);
  },

  uploadAvatar: async (formData: FormData) => {
    return apiClient.post<{ user: any }>('/users/avatar', formData);
  },

  getAllUsers: async () => {
    return apiClient.get<{ users: any[] }>('/users/all');
  },
};


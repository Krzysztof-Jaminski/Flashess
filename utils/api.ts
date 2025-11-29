import { API_BASE_URL } from './apiConfig';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Exercise {
  id: number;
  name: string;
  initialFen: string;
  pgn: string;
  analysis?: string;
  color: string;
  isPublic: boolean;
  userId: number;
  createdAt: string;
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  // Wyślij event aby TopBar się odświeżył
  window.dispatchEvent(new Event('auth-change'));
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  // Wyślij event aby TopBar się odświeżył
  window.dispatchEvent(new Event('auth-change'));
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
  // Wyślij event aby TopBar się odświeżył
  window.dispatchEvent(new Event('auth-change'));
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | { error: string }> => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Timeout 5 sekund
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return { error: errorData.message || errorData.error || 'An error occurred' };
      } catch {
        return { error: 'An error occurred' };
      }
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { error: 'Request timeout. Please try again.' };
    }
    return { error: 'Cannot connect to server. Please check your connection or try again later.' };
  }
};

export const authApi = {
  register: async (username: string, email: string, password: string): Promise<{ success: true; data: AuthResponse } | { success: false; error: string }> => {
    const response = await apiRequest<AuthResponse | { error: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (response && 'error' in response) {
      return { success: false, error: response.error };
    }
    if (response && 'access_token' in response) {
      setAuthToken(response.access_token);
      setCurrentUser(response.user);
      return { success: true, data: response };
    }
    return { success: false, error: 'An unexpected error occurred' };
  },

  login: async (username: string, password: string): Promise<{ success: true; data: AuthResponse } | { success: false; error: string }> => {
    const response = await apiRequest<AuthResponse | { error: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (response && 'error' in response) {
      return { success: false, error: response.error };
    }
    if (response && 'access_token' in response) {
      setAuthToken(response.access_token);
      setCurrentUser(response.user);
      return { success: true, data: response };
    }
    return { success: false, error: 'An unexpected error occurred' };
  },

  logout: (): void => {
    removeAuthToken();
    // Wyślij event aby TopBar się odświeżył
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  isAuthenticated: (): boolean => {
    return getAuthToken() !== null;
  },
};

export const exercisesApi = {
  create: async (exercise: {
    name: string;
    initialFen: string;
    pgn: string;
    analysis?: string;
    color?: string;
    isPublic?: boolean;
  }): Promise<Exercise | null> => {
    return apiRequest<Exercise>('/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  },

  getMyExercises: async (): Promise<Exercise[]> => {
    const result = await apiRequest<Exercise[]>('/exercises/my');
    return result || [];
  },

  getPublicExercises: async (): Promise<Exercise[]> => {
    const result = await apiRequest<Exercise[]>('/exercises/public');
    return result || [];
  },

  getById: async (id: number): Promise<Exercise | null> => {
    return apiRequest<Exercise>(`/exercises/${id}`);
  },

  update: async (id: number, exercise: {
    name?: string;
    initialFen?: string;
    pgn?: string;
    analysis?: string;
    color?: string;
    isPublic?: boolean;
  }): Promise<Exercise | null> => {
    return apiRequest<Exercise>(`/exercises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(exercise),
    });
  },

  delete: async (id: number): Promise<boolean> => {
    const result = await apiRequest<void>(`/exercises/${id}`, {
      method: 'DELETE',
    });
    return result !== null;
  },
};


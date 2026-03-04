import Cookies from 'js-cookie';
import type { ApiResponse, AuthTokens, User, QuizResult, OnboardingState } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gallagyan.onrender.com/api/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = Cookies.get('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Auth ────────────────────────────────────────────────────
export const auth = {
  async register(email: string, password: string, fullName: string) {
    const res = await request<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (res.data.accessToken) {
      Cookies.set('access_token', res.data.accessToken, { expires: 7 });
    }
    return res;
  },

  async login(email: string, password: string) {
    const res = await request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data.accessToken) {
      Cookies.set('access_token', res.data.accessToken, { expires: 7 });
    }
    return res;
  },

  logout() {
    Cookies.remove('access_token');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  },
};

// ── User ────────────────────────────────────────────────────
export const user = {
  async getProfile() {
    return request<User>('/users/me');
  },

  async updateProfile(data: Partial<User>) {
    return request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding(state: OnboardingState) {
    return request<User>('/users/onboarding', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  },
};

// ── Quiz ────────────────────────────────────────────────────
export const quiz = {
  async submitResults(answers: Record<number, string>) {
    return request<QuizResult>('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  async getResult(resultId: string) {
    return request<QuizResult>(`/quiz/result/${resultId}`);
  },
};

// ── Calculators ─────────────────────────────────────────────
export const calculators = {
  async saveResult(calculatorType: string, inputs: unknown, result: unknown) {
    return request<{ id: string }>('/calculators/save', {
      method: 'POST',
      body: JSON.stringify({ calculator_type: calculatorType, inputs, result }),
    });
  },
};

// ── Email ───────────────────────────────────────────────────
export const email = {
  async capture(emailAddress: string, source: string, metadata?: Record<string, unknown>) {
    return request<{ success: boolean }>('/email/capture', {
      method: 'POST',
      body: JSON.stringify({ email: emailAddress, source, metadata }),
    });
  },
};

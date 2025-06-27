// Authentication utilities
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  group_ids: number[];
  group_names: string[];
}

export interface AuthToken {
  token: string;
  user?: User;
  expires?: string;
}

// Token management
export const tokenManager = {
  // Get token from localStorage
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  },

  // Remove token from localStorage
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('username');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  // Get user info from token
  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id,
        username: payload.sub,
        email: '',
        name: payload.sub,
        role: payload.group_name || 'user',
        group_ids: payload.group_ids || [],
        group_names: [payload.group_name || 'user'],
      };
    } catch {
      return null;
    }
  },
};

// Auth guard for client-side protection
export const requireAuth = () => {
  if (typeof window === 'undefined') return true;

  if (!tokenManager.isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Auth guard hook for React components
export const useAuthGuard = () => {
  // Return stable values during SSR to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      logout: () => {},
    };
  }

  const isAuthenticated = tokenManager.isAuthenticated();
  const user = tokenManager.getUserFromToken();

  return {
    isAuthenticated,
    user,
    logout: () => {
      tokenManager.removeToken();
      window.location.href = '/login';
    },
  };
};

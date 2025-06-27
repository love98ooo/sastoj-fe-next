// Authentication utilities

// Cookie store type for Next.js cookies function
export interface CookieStore {
  get(name: string): { value: string } | undefined;
}

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

// JWT Payload interface
export interface JWTPayload {
  user_id: number;
  group_ids: number[];
  group_name: string;
  iss: string;
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
}

// Parse role from group_name (format: $role[_]$group)
export function parseRoleFromGroupName(groupName: string): string {
  if (!groupName) return 'user';

  // If groupName contains underscore, split and take the first part as role
  if (groupName.includes('_')) {
    return groupName.split('_')[0];
  }

  // Otherwise, the entire groupName is the role
  return groupName;
}

// Determine route based on role
export function getRouteByRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return '/dashboard'; // Admin dashboard
    case 'user':
    default:
      return '/contest'; // User contest page
  }
}

// Parse JWT token
export function parseJWTToken(token: string): JWTPayload | null {
  try {
    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));

    // Validate required fields
    if (!payload.user_id || !payload.group_name || !payload.exp) {
      throw new Error('Missing required JWT fields');
    }

    return payload as JWTPayload;
  } catch {
    return null;
  }
}

// Server-side token management
export const serverTokenManager = {
  // Get token from cookies (server-side)
  getToken(cookiesFunction?: () => CookieStore): string | null {
    try {
      if (!cookiesFunction) return null;
      const cookieStore = cookiesFunction();
      return cookieStore.get('token')?.value || null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated (server-side)
  isAuthenticated(cookiesFunction?: () => CookieStore): boolean {
    const token = this.getToken(cookiesFunction);
    if (!token) return false;

    try {
      const payload = parseJWTToken(token);
      if (!payload) return false;

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  // Get user info from token (server-side)
  getUserFromToken(cookiesFunction?: () => CookieStore): User | null {
    const token = this.getToken(cookiesFunction);
    if (!token) return null;

    try {
      const payload = parseJWTToken(token);
      if (!payload) return null;

      const role = parseRoleFromGroupName(payload.group_name);

      return {
        id: payload.user_id,
        username: payload.sub,
        email: '',
        name: payload.sub,
        role: role,
        group_ids: payload.group_ids || [],
        group_names: [payload.group_name],
      };
    } catch {
      return null;
    }
  },

  // Get user role from token (server-side)
  getUserRole(cookiesFunction?: () => CookieStore): string | null {
    const user = this.getUserFromToken(cookiesFunction);
    return user ? user.role : null;
  },

  // Get appropriate route for user (server-side)
  getUserRoute(cookiesFunction?: () => CookieStore): string {
    const user = this.getUserFromToken(cookiesFunction);
    if (!user) return '/login';

    return getRouteByRole(user.role);
  },
};

// Client-side token management
export const tokenManager = {
  // Get token from localStorage
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  // Set token in localStorage and cookies
  setToken(token: string): void {
    if (typeof window === 'undefined') return;

    // Store in localStorage for client-side access
    localStorage.setItem('token', token);

    // Also store in cookies for server-side access
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  },

  // Remove token from localStorage and cookies
  removeToken(): void {
    if (typeof window === 'undefined') return;

    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('username');

    // Remove from cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = parseJWTToken(token);
      if (!payload) return false;

      // Check if token is expired
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
      const payload = parseJWTToken(token);
      if (!payload) return null;

      const role = parseRoleFromGroupName(payload.group_name);

      return {
        id: payload.user_id,
        username: payload.sub,
        email: '',
        name: payload.sub,
        role: role,
        group_ids: payload.group_ids || [],
        group_names: [payload.group_name],
      };
    } catch {
      return null;
    }
  },

  // Get user role from token
  getUserRole(): string | null {
    const user = this.getUserFromToken();
    return user ? user.role : null;
  },

  // Get appropriate route for user
  getUserRoute(): string {
    const user = this.getUserFromToken();
    if (!user) return '/login';

    return getRouteByRole(user.role);
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

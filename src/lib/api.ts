// Next.js API Client using native fetch and best practices

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acm.sast.fun/api';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  metadata?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  current: number;
  size: number;
}

// Enhanced fetch with error handling and auth
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage (only on client side)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Token: token }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle API errors
      if (response.status === 401) {
        // Unauthorized - remove token and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }

      throw new ApiError(
        data?.message || `HTTP Error: ${response.status}`,
        response.status,
        data?.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error', 0);
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Type definitions
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Problem {
  id: number;
  type: string;
  title: string;
  content: string;
  score: number;
  index: number;
  metadata: any;
  // Additional fields that might be in the content
  difficulty?: string;
  time_limit?: number;
  memory_limit?: number;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  tags?: string[];
  accepted_count?: number;
  submission_count?: number;
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  state?: number;
  status?: number;
  type: number;
  startTime: string;
  endTime: string;
  language: string;
  extraTime: number;
  createTime?: string;
}

export interface ContestProblem {
  id: number;
  type: string;
  title: string;
  score: number;
  index: number;
  metadata: any;
}

export interface Submission {
  id: string;
  code?: string;
  language: string;
  point: number;
  state?: number; // 提交状态（详情接口）
  status?: number; // 提交状态（列表接口）
  createdAt: string;
  updatedAt?: string | null;
  totalTime?: number;
  maxMemory?: number;
}

export interface SubmissionResponse {
  uuid: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  group_ids: number[];
  group_names: string[];
  created_at: string;
  updated_at: string;
  banned: boolean;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  member_count: number;
}

// API service functions
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => api.post('/login', data),

  logout: (): Promise<void> => api.post('/logout'),

  larkLogin: (): Promise<any> => api.post('/login/lark'),

  linkLogin: (): Promise<any> => api.post('/login/link'),
};

export const problemApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
      contest_id?: number;
      difficulty?: string;
      problem_type?: string;
      tags?: string[];
    } = {}
  ): Promise<PaginatedResponse<Problem>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    return api.get(`/problem/list?${searchParams.toString()}`);
  },

  getById: (id: number): Promise<Problem> => api.get(`/problem/${id}`),

  add: (data: Partial<Problem>): Promise<Problem> => api.post('/problem', data),

  edit: (id: number, data: Partial<Problem>): Promise<Problem> => api.put(`/problem/${id}`, data),

  delete: (id: number): Promise<void> => api.delete(`/problem/${id}`),

  getTypes: (): Promise<string[]> => api.get('/problem/types'),
};

export const contestApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
      status?: string;
    } = {}
  ): Promise<PaginatedResponse<Contest>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return api.get(`/contest/list?${searchParams.toString()}`);
  },

  getById: (id: number): Promise<Contest> => api.get(`/contest/${id}`),

  add: (data: Partial<Contest>): Promise<Contest> => api.post('/contest', data),

  edit: (id: number, data: Partial<Contest>): Promise<Contest> => api.put(`/contest/${id}`, data),

  delete: (id: number): Promise<void> => api.delete(`/contest/${id}`),

  join: (id: number): Promise<void> => api.post(`/contest/${id}/join`),

  getProblems: (id: number): Promise<Problem[]> => api.get(`/contest/${id}/problems`),

  getRanking: (id: number, params?: { size?: number; current?: number }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return api.get(`/contest/${id}/ranking?${searchParams.toString()}`);
  },
};

export const submissionApi = {
  submit: (data: {
    problem_id: number;
    language: string;
    code: string;
    contest_id?: number;
  }): Promise<Submission> => api.post('/submit', data),

  selfTest: (data: {
    problem_id: number;
    language: string;
    code: string;
    input: string;
  }): Promise<any> => api.post('/selftest', data),

  getById: (id: number): Promise<Submission> => api.get(`/submission/${id}`),

  getByProblemId: (
    problemId: number,
    params?: { size?: number; current?: number }
  ): Promise<PaginatedResponse<Submission>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return api.get(`/submission/problem/${problemId}?${searchParams.toString()}`);
  },

  getHistory: (params?: {
    size?: number;
    current?: number;
  }): Promise<PaginatedResponse<Submission>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return api.get(`/submission/history?${searchParams.toString()}`);
  },

  getSelfTestDetail: (
    contestId: number,
    selfTestId: string
  ): Promise<{
    isCompiled: boolean;
    complieMsg: string;
    stdout: string;
    stderr: string;
    time: number;
    memory: number;
  }> => api.get(`/user/contests/${contestId}/self-tests/${selfTestId}`),

  getSubmissionDetail: (contestId: number, submissionId: string): Promise<Submission> =>
    api.get(`/user/contests/${contestId}/submissions/${submissionId}`),

  getSubmissionCases: (
    contestId: number,
    submissionId: string
  ): Promise<{
    cases: Array<{
      index: number;
      point: number;
      state: number;
      time: string;
      memory: string;
    }>;
  }> => api.get(`/user/contests/${contestId}/submissions/${submissionId}/cases`),
};

export const userApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
      role?: string;
      group_id?: number;
    } = {}
  ): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return api.get(`/user/list?${searchParams.toString()}`);
  },

  add: (data: Partial<User>): Promise<User> => api.post('/user', data),

  edit: (id: number, data: Partial<User>): Promise<User> => api.put(`/user/${id}`, data),

  addBatch: (data: { users: Partial<User>[] }): Promise<User[]> => api.post('/user/batch', data),
};

export const groupApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
    } = {}
  ): Promise<PaginatedResponse<Group>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return api.get(`/group/list?${searchParams.toString()}`);
  },

  getById: (id: number): Promise<Group> => api.get(`/group/${id}`),

  add: (data: Partial<Group>): Promise<Group> => api.post('/group', data),

  edit: (id: number, data: Partial<Group>): Promise<Group> => api.put(`/group/${id}`, data),

  delete: (id: number): Promise<void> => api.delete(`/group/${id}`),
};

// Contest API functions
export const contestService = {
  // Get all contests (admin)
  getContests: async (params: { size?: number; current?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = (await apiFetch(`/contest?${searchParams.toString()}`)) as any;
    return response.contests as Contest[];
  },

  // Get user's contests
  getUserContests: async () => {
    const response = (await apiFetch(`/user/contests`)) as any;
    return response.contests as Contest[];
  },

  // Get contest by ID (use user endpoint instead of admin endpoint)
  getContest: async (contestId: number) => {
    const response = (await apiFetch(`/user/contests/${contestId}/detail`)) as any;
    return response as Contest;
  },

  // Join or exit contest
  joinContest: async (contestId: number, isJoin: boolean) => {
    const response = (await apiFetch(`/user/contests/${contestId}`, {
      method: 'POST',
      body: JSON.stringify({ is_join: isJoin }),
    })) as any;
    return response.isJoin as boolean;
  },

  // Get problems in a contest
  getContestProblems: async (contestId: number) => {
    // Only use user endpoint - users must join contest to access problems
    const response = (await apiFetch(`/user/contests/${contestId}/problems`)) as any;
    return response.problems as ContestProblem[];
  },

  // Get specific problem in a contest (only for joined contests)
  getContestProblem: async (contestId: number, problemId: number) => {
    // Only use user endpoint - users must join contest to access problems
    const response = (await apiFetch(`/user/contests/${contestId}/problems/${problemId}`)) as any;
    return response as Problem;
  },

  // Submit solution to contest problem
  submitContestProblem: async (
    contestId: number,
    problemId: number,
    data: {
      code: string;
      language: string;
    }
  ): Promise<SubmissionResponse> => {
    const response = (await apiFetch(
      `/user/contests/${contestId}/problems/${problemId}/submission`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )) as SubmissionResponse;
    return response;
  },

  // Self test contest problem
  testContestProblem: async (
    contestId: number,
    problemId: number,
    data: {
      code: string;
      language: string;
      input: string;
    }
  ) => {
    const response = (await apiFetch(`/user/contests/${contestId}/problems/${problemId}/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    })) as any;
    return response.uuid as string;
  },

  // Get contest submissions
  getContestSubmissions: async (
    contestId: number,
    problemId: number,
    params: { size?: number; current?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = (await apiFetch(
      `/user/contests/${contestId}/problems/${problemId}/submissions?${searchParams.toString()}`
    )) as any;
    return response.submissions as Submission[];
  },

  // Get contest ranking
  getContestRanking: async (
    contestId: number,
    params: { size?: number; current?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = (await apiFetch(
      `/user/contests/${contestId}/ranking?${searchParams.toString()}`
    )) as any;
    return response;
  },
};

// Update problem service to be contest-aware
export const problemService = {
  // Get problems by contest (this is now the primary way to get problems)
  getProblems: async (contestId?: number, params: { size?: number; current?: number } = {}) => {
    if (contestId) {
      return contestService.getContestProblems(contestId);
    }

    // Fallback to admin problem list if no contest specified
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = (await apiFetch(`/problem/list?${searchParams.toString()}`)) as any;
    return response.problems as Problem[];
  },

  // Get problem (contest-aware)
  getProblem: async (problemId: number, contestId?: number) => {
    if (contestId) {
      return contestService.getContestProblem(contestId, problemId);
    }

    // Fallback to admin problem endpoint
    const response = (await apiFetch(`/problem/${problemId}`)) as any;
    return response as Problem;
  },

  // Submit code (contest-aware)
  submitCode: async (data: {
    problem_id: number;
    contest_id?: number;
    code: string;
    language: string;
  }) => {
    if (data.contest_id) {
      return contestService.submitContestProblem(data.contest_id, data.problem_id, {
        code: data.code,
        language: data.language,
      });
    }

    // Fallback to general submission endpoint
    const response = (await apiFetch(`/submission`, {
      method: 'POST',
      body: JSON.stringify(data),
    })) as any;
    return response;
  },

  // Self test (contest-aware)
  selfTest: async (data: {
    problem_id: number;
    contest_id?: number;
    code: string;
    language: string;
    input: string;
  }) => {
    if (data.contest_id) {
      return contestService.testContestProblem(data.contest_id, data.problem_id, {
        code: data.code,
        language: data.language,
        input: data.input,
      });
    }

    // Fallback to general self-test endpoint
    const response = (await apiFetch(`/self-test`, {
      method: 'POST',
      body: JSON.stringify(data),
    })) as any;
    return response.uuid as string;
  },
};

// Problem detail page related interfaces
export interface SubmissionDetail {
  code?: string;
  language: string;
  point: number;
  state?: number;
  createdAt: string;
  updatedAt?: string | null;
  totalTime?: number;
  maxMemory?: number;
  testCases: TestCase[];
}

export interface TestCase {
  index: number;
  point: number;
  state: number; // 1: 通过, 其他: 未通过
  time: string; // 执行时间 (纳秒)
  memory: string; // 内存使用 (字节)
}

export interface SelfTestResult {
  success: boolean;
  output: string;
  executionTime: string;
  memory: string;
  verdict?: string;
  stderr?: string;
}

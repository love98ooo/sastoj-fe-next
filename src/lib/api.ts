// Next.js API Client using native fetch and best practices
import * as z from 'zod/v4';
import {
  ApiErrorResponseSchema,
  LoginRequest,
  LoginResponse,
  LoginResponseSchema,
  PaginatedResponse,
  Contest,
  ContestSchema,
  ContestsResponseSchema,
  ProblemSchema,
  ContestProblemsResponseSchema,
  ContestSubmissionsResponseSchema,
  JoinContestResponseSchema,
  TestResponseSchema,
  SubmissionResponseSchema,
  SelfTestResponseSchema,
  ContestRankingResponseSchema,
  ContestRankingResponse,
  Problem,
  Submission,
  TestCase,
  SelfTestResult,
  SelfTestResponse,
  User,
  Group,
  GroupSchema,
  GroupsResponseSchema,
  GroupCreateResponseSchema,
  GroupUpdateResponseSchema,
  GroupsResponse,
  GroupCreateResponse,
  GroupUpdateResponse,
  UserCreateRequest,
  UserUpdateRequest,
  UserCreateResponse,
  BatchUserCreateRequest,
  BatchUserCreateResponse,
  UsersResponse,
} from './schemas';
import { ApiValidator } from './api-validator';

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

  const response = await fetch(url, config);

  // Handle different response types
  const contentType = response.headers.get('content-type');
  let data: unknown;

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

    if (response.status === 404) {
      throw new ApiError('Not Found', response.status);
    }

    // 尝试解析错误响应
    const errorData = ApiErrorResponseSchema.parse(data);
    throw new ApiError(errorData.message, response.status, errorData.code.toString());
  }

  return data as T;
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

// API service functions
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/login', data).then(res => ApiValidator.parse(res, LoginResponseSchema)),

  logout: (): Promise<void> => api.post('/logout'),

  larkLogin: (): Promise<unknown> => api.post('/login/lark'),

  linkLogin: (): Promise<unknown> => api.post('/login/link'),
};

export const problemApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
      contest_id?: string;
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

  getById: (id: string): Promise<Problem> => api.get(`/problem/${id}`),

  add: (data: Partial<Problem>): Promise<Problem> => api.post('/problem', data),

  edit: (id: string, data: Partial<Problem>): Promise<Problem> => api.put(`/problem/${id}`, data),

  delete: (id: string): Promise<void> => api.delete(`/problem/${id}`),

  getTypes: (): Promise<string[]> => api.get('/problem/types'),
};

export const contestApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
      status?: string;
      title?: string;
    } = {}
  ): Promise<{ contests: Contest[]; total: number; current: number; size: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return api.get(`/contest?${searchParams.toString()}`);
  },

  getById: (id: string): Promise<Contest> => api.get(`/contest/${id}`),

  add: (data: Partial<Contest>): Promise<Contest> => api.post('/contest', data),

  edit: (data: Partial<Contest>): Promise<Contest> => api.put(`/contest`, data),

  delete: (id: string): Promise<void> => api.delete(`/contest/${id}`),

  rank: (id: string) => api.post(`/contest/${id}/rank`),

  getRanking: (
    id: string,
    params?: { size?: number; current?: number }
  ): Promise<ContestRankingResponse> => {
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

  addContestants: (groupId: number, contestId: number, role: number) =>
    api.post(`/contest/contestants`, {
      group_id: groupId,
      contest_id: contestId,
      role: role,
    }),
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
  }): Promise<SelfTestResponse> => api.post('/selftest', data),

  getById: (id: string): Promise<Submission> => api.get(`/submission/${id}`),

  getByProblemId: (
    problemId: string,
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

  getSelfTestDetail: (contestId: string, selfTestId: string): Promise<SelfTestResult> =>
    api.get(`/user/contests/${contestId}/self-tests/${selfTestId}`),

  getSubmissionDetail: (contestId: string, submissionId: string): Promise<Submission> =>
    api.get(`/user/contests/${contestId}/submissions/${submissionId}`),

  getSubmissionCases: (
    contestId: string,
    submissionId: string
  ): Promise<{
    cases: TestCase[];
  }> => api.get(`/user/contests/${contestId}/submissions/${submissionId}/cases`),
};

export const userApi = {
  // 获取用户列表 (管理员端)
  getUsers: async (
    params: {
      current?: number;
      size?: number;
      group_ids?: string[];
      username?: string;
      state?: number;
    } = {}
  ): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();

    if (params.current) searchParams.set('current', params.current.toString());
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.username) searchParams.set('username', params.username);
    if (params.state !== undefined) searchParams.set('state', params.state.toString());

    // group_ids 是数组，需要特殊处理
    if (params.group_ids) {
      params.group_ids.forEach(id => searchParams.append('group_ids', id));
    }

    const response = await apiFetch<UsersResponse>(`/users?${searchParams.toString()}`);
    return response;
  },

  // 创建单个用户
  createUser: async (data: UserCreateRequest): Promise<UserCreateResponse> => {
    const response = await apiFetch<UserCreateResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // 批量创建用户
  batchCreateUsers: async (data: BatchUserCreateRequest): Promise<BatchUserCreateResponse> => {
    const response = await apiFetch<BatchUserCreateResponse>('/users/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // 更新用户
  updateUser: async (data: UserUpdateRequest): Promise<void> => {
    await apiFetch<void>('/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 保留旧的方法以保持兼容性
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

  edit: (id: string, data: Partial<User>): Promise<User> => api.put(`/user/${id}`, data),

  addBatch: (data: { users: Partial<User>[] }): Promise<User[]> => api.post('/user/batch', data),
};

export const groupApi = {
  getList: (
    params: {
      size?: number;
      current?: number;
    } = {}
  ): Promise<GroupsResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return api
      .get(`/group?${searchParams.toString()}`)
      .then(res => ApiValidator.parse(res, GroupsResponseSchema));
  },

  getById: (id: string): Promise<Group> =>
    api.get(`/group/${id}`).then(res => ApiValidator.parse(res, GroupSchema)),

  create: (data: { name: string }): Promise<GroupCreateResponse> =>
    api.post('/group', data).then(res => ApiValidator.parse(res, GroupCreateResponseSchema)),

  update: (data: { id: number; name: string }): Promise<GroupUpdateResponse> =>
    api.put('/group', data).then(res => ApiValidator.parse(res, GroupUpdateResponseSchema)),

  delete: (id: string): Promise<void> => api.delete(`/group/${id}`),
};

// Contest API functions
export const contestService = {
  // Get all contests (admin)
  getContests: async (params: { size?: number; current?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = await apiFetch<unknown>(`/contest?${searchParams.toString()}`);
    return ApiValidator.parse(response, ContestsResponseSchema).contests;
  },

  // Get user's contests
  getUserContests: async () => {
    const response = await apiFetch<unknown>(`/user/contests`);
    return ApiValidator.parse(response, ContestsResponseSchema).contests;
  },

  // Get contest by ID (use user endpoint instead of admin endpoint)
  getContest: async (contestId: string) => {
    const response = await apiFetch<unknown>(`/user/contests/${contestId}/detail`);
    return ApiValidator.parse(response, ContestSchema);
  },

  // Join or exit contest
  joinContest: async (contestId: string, isJoin: boolean) => {
    const response = await apiFetch<unknown>(`/user/contests/${contestId}`, {
      method: 'POST',
      body: JSON.stringify({ is_join: isJoin }),
    });
    return ApiValidator.parse(response, JoinContestResponseSchema).isJoin;
  },

  // Get problems in a contest
  getContestProblems: async (contestId: string) => {
    // Only use user endpoint - users must join contest to access problems
    const response = await apiFetch<unknown>(`/user/contests/${contestId}/problems`);
    return ApiValidator.parse(response, ContestProblemsResponseSchema).problems;
  },

  // Get specific problem in a contest (only for joined contests)
  getContestProblem: async (contestId: string, problemId: string) => {
    // Only use user endpoint - users must join contest to access problems
    const response = await apiFetch<unknown>(`/user/contests/${contestId}/problems/${problemId}`);
    return ApiValidator.parse(response, ProblemSchema);
  },

  // Submit solution to contest problem
  submitContestProblem: async (
    contestId: string,
    problemId: string,
    data: {
      code: string;
      language: string;
    }
  ) => {
    const response = await apiFetch<unknown>(
      `/user/contests/${contestId}/problems/${problemId}/submission`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return ApiValidator.parse(response, SubmissionResponseSchema);
  },

  // Self test contest problem
  testContestProblem: async (
    contestId: string,
    problemId: string,
    data: {
      code: string;
      language: string;
      input: string;
    }
  ) => {
    const response = await apiFetch<unknown>(
      `/user/contests/${contestId}/problems/${problemId}/test`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    const validatedResponse = ApiValidator.parse(response, TestResponseSchema);
    return validatedResponse.uuid;
  },

  // Get contest submissions
  getContestSubmissions: async (
    contestId: string,
    problemId: string,
    params: { size?: number; current?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = await apiFetch<unknown>(
      `/user/contests/${contestId}/problems/${problemId}/submissions?${searchParams.toString()}`
    );
    return ApiValidator.parse(response, ContestSubmissionsResponseSchema).submissions;
  },

  // Get contest ranking
  getContestRanking: async (
    contestId: string,
    params: { size?: number; current?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = await apiFetch<unknown>(
      `/user/contests/${contestId}/ranking?${searchParams.toString()}`
    );
    return ApiValidator.parse(response, ContestRankingResponseSchema);
  },
};

// Update problem service to be contest-aware
export const problemService = {
  // Get problems by contest (this is now the primary way to get problems)
  getProblems: async (contestId?: string, params: { size?: number; current?: number } = {}) => {
    if (contestId) {
      return contestService.getContestProblems(contestId);
    }

    // Fallback to admin problem list if no contest specified
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.current) searchParams.set('current', params.current.toString());

    const response = await apiFetch<unknown>(`/problem/list?${searchParams.toString()}`);
    // 创建一个临时schema来解析包含problems数组的响应
    const ProblemsResponseSchema = z.object({
      problems: z.array(ProblemSchema),
    });
    return ApiValidator.parse(response, ProblemsResponseSchema).problems;
  },

  // Get problem (contest-aware)
  getProblem: async (problemId: string, contestId?: string) => {
    if (contestId) {
      return contestService.getContestProblem(contestId, problemId);
    }

    // Fallback to admin problem endpoint
    const response = await apiFetch<unknown>(`/problem/${problemId}`);
    return ApiValidator.parse(response, ProblemSchema);
  },

  // Submit code (contest-aware)
  submitCode: async (data: {
    problem_id: string;
    contest_id?: string;
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
    const response = await apiFetch<unknown>(`/submission`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return ApiValidator.parse(response, SubmissionResponseSchema);
  },

  // Self test (contest-aware)
  selfTest: async (data: {
    problem_id: string;
    contest_id?: string;
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
    const response = await apiFetch<unknown>(`/self-test`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return ApiValidator.parse(response, SelfTestResponseSchema).uuid;
  },
};

// Re-export schemas and types for convenience
export * from './schemas';

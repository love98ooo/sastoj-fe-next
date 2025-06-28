import * as z from 'zod/v4';

// 通用错误响应包装器 - 用于HTTP状态码非200的情况
export const ApiErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  reason: z.string().optional(),
});

// 分页响应结构
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    current: z.number(),
    size: z.number(),
  });

// 问题类型定义
export const ProblemTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  judge: z.string(),
});

export const ProblemTypesResponseSchema = z.object({
  types: z.array(ProblemTypeSchema),
});

// 基础类型定义
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  groupIds: z.array(z.number()),
  createdAt: z.string(),
  updatedAt: z.string(),
  state: z.number(),
});

// 用户管理相关的 schema
export const UserCreateRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
  groupIds: z.array(z.number()),
});

export const UserUpdateRequestSchema = z.object({
  id: z.string(),
  username: z.string(),
  groupIds: z.array(z.string()),
  state: z.number(),
});

export const UserCreateResponseSchema = z.object({
  id: z.string(),
});

export const BatchUserCreateRequestSchema = z.object({
  groupIds: z.array(z.number()),
  number: z.number(),
});

export const BatchUserCreateResponseSchema = z.object({
  users: z.array(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  ),
});

export const UsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  current: z.number(),
  size: z.number(),
});

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const GroupsResponseSchema = z.object({
  groups: z.array(GroupSchema),
});

export const GroupCreateResponseSchema = z.object({
  id: z.string(),
});

export const GroupUpdateResponseSchema = z.object({
  success: z.boolean(),
});

export const ContestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  state: z.number().optional(),
  status: z.number().optional(),
  type: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  language: z.string(),
  extraTime: z.number(),
  createTime: z.string().optional(),
});

export const ProblemSchema = z.object({
  id: z.string(),
  typeId: z.string(),
  title: z.string(),
  content: z.string(),
  score: z.number().optional(),
  point: z.number().optional(),
  contestId: z.string().optional(),
  caseVersion: z.number().optional(),
  index: z.number().optional(),
  config: z.string(),
  ownerId: z.number(),
  visibility: z.string(),
  metadata: z.record(z.string(), z.any()),
  // 可选字段
  difficulty: z.string().optional(),
  time_limit: z.number().optional(),
  memory_limit: z.number().optional(),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  constraints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  accepted_count: z.number().optional(),
  submission_count: z.number().optional(),
});

export const ProblemListResponseSchema = z.object({
  currency: z.number().optional(),
  total: z.number(),
  problems: z.array(ProblemSchema),
});

export const ContestProblemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  score: z.number(),
  index: z.number(),
  metadata: z.record(z.string(), z.string()),
});

export const SubmissionSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  language: z.string(),
  point: z.number(),
  state: z.number().optional(),
  status: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  totalTime: z.number().optional(),
  maxMemory: z.number().optional(),
});

export const TestCaseSchema = z.object({
  index: z.number(),
  point: z.number(),
  state: z.number(),
  time: z.string(),
  memory: z.string(),
});

export const SubmissionDetailSchema = SubmissionSchema.extend({
  testCases: z.array(TestCaseSchema),
});

export const SelfTestResultSchema = z.object({
  complieMsg: z.string(),
  isCompiled: z.boolean(),
  memory: z.number(),
  stderr: z.string(),
  stdout: z.string(),
  time: z.number(),
});

// 登录请求和响应
export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
});

// 排名相关
export const RankingProblemSchema = z.object({
  problemId: z.string(),
  state: z.number(),
  point: z.number(),
  triedTimes: z.number(),
  scoreAchievedTime: z.string(),
});

export const RankingUserSchema = z.object({
  problems: z.array(RankingProblemSchema),
  username: z.string(),
  totalScore: z.number(),
  rank: z.number(),
  penalty: z.number(),
});

export const ContestRankingResponseSchema = z.object({
  users: z.array(RankingUserSchema),
});

// API 响应类型
export const ContestsResponseSchema = z.object({
  contests: z.array(ContestSchema),
});

export const ContestProblemsResponseSchema = z.object({
  problems: z.array(ContestProblemSchema),
});

export const ContestSubmissionsResponseSchema = z.object({
  submissions: z.array(SubmissionSchema),
});

export const JoinContestResponseSchema = z.object({
  isJoin: z.boolean(),
});

export const TestResponseSchema = z.object({
  uuid: z.string(),
});

export const SubmissionResponseSchema = z.object({
  uuid: z.string(),
});

export const SelfTestResponseSchema = z.object({
  uuid: z.string(),
});

// 从Schema中导出类型
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>
>;
export type ProblemType = z.infer<typeof ProblemTypeSchema>;
export type User = z.infer<typeof UserSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type GroupsResponse = z.infer<typeof GroupsResponseSchema>;
export type GroupCreateResponse = z.infer<typeof GroupCreateResponseSchema>;
export type GroupUpdateResponse = z.infer<typeof GroupUpdateResponseSchema>;
export type Contest = z.infer<typeof ContestSchema>;
export type Problem = z.infer<typeof ProblemSchema>;
export type ContestProblem = z.infer<typeof ContestProblemSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;
export type SubmissionDetail = z.infer<typeof SubmissionDetailSchema>;
export type SelfTestResult = z.infer<typeof SelfTestResultSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RankingProblem = z.infer<typeof RankingProblemSchema>;
export type RankingUser = z.infer<typeof RankingUserSchema>;
export type ContestRankingResponse = z.infer<typeof ContestRankingResponseSchema>;
export type SelfTestResponse = z.infer<typeof SelfTestResponseSchema>;
export type UserCreateRequest = z.infer<typeof UserCreateRequestSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;
export type UserCreateResponse = z.infer<typeof UserCreateResponseSchema>;
export type BatchUserCreateRequest = z.infer<typeof BatchUserCreateRequestSchema>;
export type BatchUserCreateResponse = z.infer<typeof BatchUserCreateResponseSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
export type ProblemListResponse = z.infer<typeof ProblemListResponseSchema>;

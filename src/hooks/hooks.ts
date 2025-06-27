import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  contestService,
  problemService,
  submissionApi,
  userApi,
  groupApi,
  authApi,
  Submission,
} from '../lib/api';
import type { SWRConfiguration } from 'swr';
import { useSubmissionPolling, useSelfTestPolling } from './use-submission-polling';
import { useCallback } from 'react';

// Contest hooks
export function useContests() {
  return useSWR('/admin/contests', () => contestService.getContests());
}

export function useUserContests() {
  return useSWR('/user/contests', () => contestService.getUserContests());
}

export function useContest(contestId: number) {
  return useSWR(contestId ? `/contest/${contestId}` : null, () =>
    contestService.getContest(contestId)
  );
}

export function useContestProblems(contestId: number) {
  return useSWR(contestId ? `/user/contests/${contestId}/problems` : null, () =>
    contestService.getContestProblems(contestId)
  );
}

export function useContestRanking(contestId: number, params?: { size?: number; current?: number }) {
  return useSWR(contestId ? `/contests/${contestId}/ranking` : null, () =>
    contestService.getContestRanking(contestId, params)
  );
}

export function useJoinContest() {
  return useSWRMutation(
    '/user/contests/join',
    async (_key: string, { arg: _arg }: { arg: { contestId: number; isJoin: boolean } }) => {
      // Currently returning mock data - replace with actual API call
      return {
        code: 200,
        message: 'success',
        data: {
          isJoined: true,
        },
      };
      //   return contestService.joinContest(_arg.contestId, _arg.isJoin)
    }
  );
}

// Problem hooks (contest-aware)
export function useProblems(
  contestId?: number,
  params?: {
    size?: number;
    current?: number;
  }
) {
  return useSWR(
    contestId
      ? `/contests/${contestId}/problems`
      : `/problems?${new URLSearchParams(params as Record<string, string>).toString()}`,
    () => problemService.getProblems(contestId, params)
  );
}

export function useProblem(problemId: number, contestId?: number) {
  return useSWR(
    problemId && contestId
      ? `/contests/${contestId}/problems/${problemId}`
      : problemId
        ? `/problems/${problemId}`
        : null,
    () => problemService.getProblem(problemId, contestId)
  );
}

// Submission hooks
export function useSubmissions(
  params?: { size?: number; current?: number },
  options?: SWRConfiguration
) {
  return useSWR(
    params ? ['submissions', params] : 'submissions',
    () => submissionApi.getByProblemId(0, params), // This might need to be adjusted based on your API
    options
  );
}

export function useSubmission(id: number | null, options?: SWRConfiguration) {
  return useSWR(
    id ? ['submission', id] : null,
    () => (id ? submissionApi.getById(id) : null),
    options
  );
}

export function useProblemSubmissions(
  problemId: number,
  params?: { size?: number; current?: number }
) {
  return useSWR(problemId ? `/problems/${problemId}/submissions` : null, () =>
    submissionApi.getByProblemId(problemId, params)
  );
}

export function useContestSubmissions(
  contestId: number,
  problemId: number,
  params?: { size?: number; current?: number }
) {
  return useSWR(
    contestId && problemId ? `/contests/${contestId}/problems/${problemId}/submissions` : null,
    () => contestService.getContestSubmissions(contestId, problemId, params)
  );
}

export function useSubmissionHistory(
  params?: {
    size?: number;
    current?: number;
  },
  options?: SWRConfiguration
) {
  return useSWR(
    params ? ['submission-history', params] : 'submission-history',
    () => submissionApi.getByProblemId(0, params), // Adjust based on your API
    options
  );
}

// User hooks
export function useUsers(
  params?: {
    size?: number;
    current?: number;
    role?: string;
    group_id?: number;
  },
  options?: SWRConfiguration
) {
  return useSWR(params ? ['users', params] : 'users', () => userApi.getList(params || {}), options);
}

// Group hooks
export function useGroups(
  params?: {
    size?: number;
    current?: number;
  },
  options?: SWRConfiguration
) {
  return useSWR(
    params ? ['groups', params] : 'groups',
    () => groupApi.getList(params || {}),
    options
  );
}

export function useGroup(id: number | null, options?: SWRConfiguration) {
  return useSWR(id ? ['group', id] : null, () => (id ? groupApi.getById(id) : null), options);
}

// Mutation hooks for code submission
export function useSubmitCode() {
  return useSWRMutation(
    '/submit',
    async (
      _key: string,
      {
        arg,
      }: {
        arg: {
          problem_id: number;
          contest_id?: number;
          code: string;
          language: string;
        };
      }
    ) => {
      return problemService.submitCode(arg);
    }
  );
}

export function useSelfTest() {
  return useSWRMutation(
    '/self-test',
    async (
      _key: string,
      {
        arg,
      }: {
        arg: {
          problem_id: number;
          contest_id?: number;
          code: string;
          language: string;
          input: string;
        };
      }
    ) => {
      return problemService.selfTest(arg);
    }
  );
}

// Auth hooks
export function useLogin() {
  return useSWRMutation(
    '/login',
    async (_key: string, { arg }: { arg: { username: string; password: string } }) => {
      return authApi.login(arg);
    }
  );
}

export function useLogout() {
  return useSWRMutation('/logout', async () => {
    return authApi.logout();
  });
}

// 使用提交轮询的统一 hook
export function useSubmissionWithPolling(
  submissionId?: string,
  contestId?: number,
  options?: {
    interval?: number;
    maxAttempts?: number;
    onStatusChange?: (submission: Submission) => void;
    onComplete?: (submission: Submission) => void;
  }
) {
  const {
    submission,
    error,
    isLoading,
    isPolling,
    startPolling: startPollingOriginal,
    stopPolling,
    refresh,
  } = useSubmissionPolling({
    submissionId,
    contestId,
    enabled: !!submissionId && !!contestId,
    interval: options?.interval || 2000,
    maxAttempts: options?.maxAttempts || 150,
    onStatusChange: options?.onStatusChange,
    onComplete: options?.onComplete,
  });

  // 使用useCallback确保startPolling函数引用稳定
  const startPolling = useCallback(() => {
    if (submissionId && contestId) {
      // 检查是否已经在轮询以避免重复启动
      if (!isPolling) {
        startPollingOriginal();
      }
    }
  }, [submissionId, contestId, startPollingOriginal, isPolling]);

  return {
    submission,
    error,
    isLoading,
    isPolling,
    startPolling,
    stopPolling,
    refresh,
  };
}

// Define SelfTestData interface to match the polling hook
interface SelfTestData {
  isCompiled: boolean;
  complieMsg?: string;
  stdout?: string;
  stderr?: string;
  time: number;
  memory: number;
}

// 使用自测轮询的统一 hook
export function useSelfTestWithPolling(
  selfTestId?: string,
  contestId?: number,
  options?: {
    interval?: number;
    maxAttempts?: number;
    onStatusChange?: (result: SelfTestData) => void;
    onComplete?: (result: SelfTestData) => void;
  }
) {
  const {
    result,
    error,
    isLoading,
    isPolling,
    startPolling: startPollingOriginal,
    stopPolling,
    refresh,
  } = useSelfTestPolling({
    selfTestId,
    contestId,
    enabled: !!selfTestId && !!contestId,
    interval: options?.interval || 2000,
    maxAttempts: options?.maxAttempts || 30,
    onStatusChange: options?.onStatusChange,
    onComplete: options?.onComplete,
  });

  // 使用useCallback确保startPolling函数引用稳定
  const startPolling = useCallback(() => {
    if (selfTestId && contestId) {
      // 检查是否已经在轮询以避免重复启动
      if (!isPolling) {
        startPollingOriginal();
      }
    }
  }, [selfTestId, contestId, startPollingOriginal, isPolling]);

  return {
    result,
    error,
    isLoading,
    isPolling,
    startPolling,
    stopPolling,
    refresh,
  };
}

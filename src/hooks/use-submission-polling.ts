'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  SubmissionStatus,
  isStatusPending,
  mapApiStateToSubmissionStatus,
} from '../lib/submission-status';
import { Submission, SelfTestResult } from '../lib/api';

interface UseSubmissionPollingOptions {
  submissionId?: string;
  contestId?: string;
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onStatusChange?: (submission: Submission) => void;
  onComplete?: (submission: Submission) => void;
}

interface UseSelfTestPollingOptions {
  selfTestId?: string;
  contestId?: string;
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onStatusChange?: (result: SelfTestResult) => void;
  onComplete?: (result: SelfTestResult) => void;
}

export function useSubmissionPolling({
  submissionId,
  contestId,
  enabled = true,
  interval = 2000, // 2秒轮询间隔
  maxAttempts = 150, // 最大轮询次数 (5分钟)
  onStatusChange,
  onComplete,
}: UseSubmissionPollingOptions) {
  const [attempts, setAttempts] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const previousStatusRef = useRef<SubmissionStatus | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetcher = async (url: string): Promise<Submission> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acm.sast.fun/api';
    const fullUrl = `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        Token: localStorage.getItem('token') || '',
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  };

  const shouldFetch = enabled && submissionId && contestId && isPolling;
  const {
    data: submission,
    error,
    mutate,
    isLoading,
  } = useSWR(
    shouldFetch ? `/user/contests/${contestId}/submissions/${submissionId}` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const startPolling = () => {
    if (!submissionId || isPolling) return;

    setIsPolling(true);
    setAttempts(0);
    poll();
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const poll = async () => {
    if (!submissionId || attempts >= maxAttempts) {
      stopPolling();
      return;
    }

    try {
      await mutate(); // 触发数据更新
      setAttempts(prev => prev + 1);
    } catch {
      setAttempts(prev => prev + 1);
    }
  };

  const getSubmissionStatus = (submission: Submission): SubmissionStatus => {
    return mapApiStateToSubmissionStatus(submission.state ?? 0);
  };

  useEffect(() => {
    if (!submission) return;

    const currentStatus = getSubmissionStatus(submission);
    const previousStatus = previousStatusRef.current;

    if (previousStatus !== null && previousStatus !== currentStatus) {
      onStatusChange?.(submission);
    }

    if (!isStatusPending(currentStatus)) {
      stopPolling();
      onComplete?.(submission);
    } else if (isPolling && attempts < maxAttempts) {
      timeoutRef.current = setTimeout(poll, interval);
    }

    previousStatusRef.current = currentStatus;
  }, [submission, attempts, maxAttempts, interval, isPolling, onStatusChange, onComplete]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (submission && isStatusPending(getSubmissionStatus(submission)) && !isPolling) {
      startPolling();
    }
  }, [submission]);

  return {
    submission,
    error,
    isLoading,
    isPolling,
    attempts,
    maxAttempts,
    startPolling,
    stopPolling,
    refresh: mutate,
  };
}

export function useSelfTestPolling({
  selfTestId,
  contestId,
  enabled = true,
  interval = 2000,
  maxAttempts = 30,
  onStatusChange,
  onComplete,
}: UseSelfTestPollingOptions) {
  const [attempts, setAttempts] = useState(0);
  const shouldStopRef = useRef(false);
  const previousResultRef = useRef<SelfTestResult | null>(null);

  // 使用SWR进行数据获取和轮询
  const fetcher = useCallback(
    async (url: string): Promise<SelfTestResult | null> => {
      if (shouldStopRef.current || attempts >= maxAttempts) return null;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acm.sast.fun/api';
      const fullUrl = `${API_BASE_URL}${url}`;

      try {
        const response = await fetch(fullUrl, {
          headers: {
            Token: localStorage.getItem('token') || '',
            'Content-Type': 'application/json',
          },
        });

        // 根据HTTP状态码控制轮询逻辑
        if (response.status === 200) {
          // 200状态码 - 获取结果并停止轮询
          shouldStopRef.current = true;
          const data = await response.json();
          return data;
        } else if (response.status === 500) {
          // 500状态码 - 继续轮询
          setAttempts(prev => prev + 1);
          return null;
        } else {
          // 其他状态码 - 停止轮询
          shouldStopRef.current = true;
          return null;
        }
      } catch {
        // 出错时增加尝试次数但继续轮询
        setAttempts(prev => prev + 1);
        return null;
      }
    },
    [attempts, maxAttempts]
  );

  const shouldPoll =
    enabled && selfTestId && contestId && attempts < maxAttempts && !shouldStopRef.current;

  const {
    data: result,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR(shouldPoll ? `/user/contests/${contestId}/self-tests/${selfTestId}` : null, fetcher, {
    refreshInterval: shouldPoll ? interval : 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0, // 禁用重复请求的去重
    onSuccess: data => {
      if (!data) return;

      // 处理状态变化
      if (
        previousResultRef.current &&
        JSON.stringify(previousResultRef.current) !== JSON.stringify(data)
      ) {
        onStatusChange?.(data);
      }

      // 如果结果已完成，调用完成回调
      previousResultRef.current = data;
      onComplete?.(data);
    },
  });

  // 手动开始轮询
  const startPolling = useCallback(() => {
    if (!selfTestId || !contestId) return;

    shouldStopRef.current = false;
    setAttempts(0);
    mutate();
  }, [selfTestId, contestId, mutate]);

  // 手动停止轮询
  const stopPolling = useCallback(() => {
    shouldStopRef.current = true;
  }, []);

  // 手动刷新
  const refresh = useCallback(() => {
    if (selfTestId && contestId) {
      mutate();
    }
  }, [selfTestId, contestId, mutate]);

  // 自动清理
  useEffect(() => {
    return () => {
      shouldStopRef.current = true;
    };
  }, []);

  // 当ID变化时重置
  useEffect(() => {
    if (selfTestId && contestId && enabled) {
      shouldStopRef.current = false;
      setAttempts(0);
    } else {
      shouldStopRef.current = true;
    }
  }, [selfTestId, contestId, enabled]);

  const isPolling = shouldPoll && !shouldStopRef.current;

  return {
    result,
    error: swrError,
    isLoading,
    isPolling,
    attempts,
    maxAttempts,
    startPolling,
    stopPolling,
    refresh,
  };
}

export function useSubmissionStatus(submissionId?: string, contestId?: string) {
  const { submission } = useSubmissionPolling({
    submissionId,
    contestId,
    enabled: Boolean(submissionId && contestId),
  });

  const statusCode = submission?.state ?? 0;
  const status = mapApiStateToSubmissionStatus(statusCode);

  return {
    submission,
    statusCode,
    status,
    isPending: isStatusPending(status),
  };
}

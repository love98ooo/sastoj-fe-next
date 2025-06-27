'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  SubmissionStatus,
  isStatusPending,
  mapApiStateToSubmissionStatus,
} from '../lib/submission-status';

interface SubmissionData {
  id: string;
  code: string;
  language: string;
  point: number;
  state: number;
  createdAt: string;
  updatedAt: string | null;
  totalTime: number;
  maxMemory: number;
  [key: string]: any;
}

interface SelfTestData {
  isCompiled: boolean;
  complieMsg?: string;
  stdout?: string;
  stderr?: string;
  time: number;
  memory: number;
}

interface UseSubmissionPollingOptions {
  submissionId?: string;
  contestId?: number;
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onStatusChange?: (submission: SubmissionData) => void;
  onComplete?: (submission: SubmissionData) => void;
}

interface UseSelfTestPollingOptions {
  selfTestId?: string;
  contestId?: number;
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onStatusChange?: (result: SelfTestData) => void;
  onComplete?: (result: SelfTestData) => void;
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

  // 获取提交详情的 API 调用
  const fetcher = async (url: string): Promise<SubmissionData> => {
    // 构造完整的 API URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acm.sast.fun/api';
    const fullUrl = `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        Token: localStorage.getItem('token') || '',
        'Content-Type': 'application/json',
      },
    });

    // if (!response.ok) {
    //   throw new Error('Failed to fetch submission')
    // }

    return response.json();
  };

  // 使用 SWR 获取提交状态，但只在需要时启用
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
      refreshInterval: 0, // 我们手动控制轮询
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 开始轮询
  const startPolling = () => {
    if (!submissionId || isPolling) return;

    setIsPolling(true);
    setAttempts(0);
    poll();
  };

  // 停止轮询
  const stopPolling = () => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 轮询逻辑
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

  // 获取提交状态
  const getSubmissionStatus = (submission: SubmissionData): SubmissionStatus => {
    return mapApiStateToSubmissionStatus(submission.state ?? 0);
  };

  // 处理状态变化
  useEffect(() => {
    if (!submission) return;

    const currentStatus = getSubmissionStatus(submission);
    const previousStatus = previousStatusRef.current;

    // 状态发生变化时的回调
    if (previousStatus !== null && previousStatus !== currentStatus) {
      onStatusChange?.(submission);
    }

    // 如果状态不再是等待中或评测中，停止轮询
    if (!isStatusPending(currentStatus)) {
      stopPolling();
      onComplete?.(submission);
    } else if (isPolling && attempts < maxAttempts) {
      // 继续轮询
      timeoutRef.current = setTimeout(poll, interval);
    }

    previousStatusRef.current = currentStatus;
  }, [submission, attempts, maxAttempts, interval, isPolling, onStatusChange, onComplete]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 自动开始轮询（如果提交状态需要轮询）
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

// 自测结果轮询 Hook
export function useSelfTestPolling({
  selfTestId,
  contestId,
  enabled = true,
  interval = 2000, // 2秒轮询间隔
  maxAttempts = 30, // 最大轮询次数 (60秒)
  onStatusChange,
  onComplete,
}: UseSelfTestPollingOptions) {
  const [attempts, setAttempts] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const previousResultRef = useRef<SelfTestData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 获取自测详情的 API 调用
  const fetcher = async (url: string): Promise<SelfTestData> => {
    // 构造完整的 API URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acm.sast.fun/api';
    const fullUrl = `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        Token: localStorage.getItem('token') || '',
        'Content-Type': 'application/json',
      },
    });

    // if (!response.ok) {
    //   throw new Error('Failed to fetch self test result')
    // }

    return response.json();
  };

  // 使用 SWR 获取自测状态，但只在需要时启用
  const shouldFetch = enabled && selfTestId && contestId && isPolling;
  const {
    data: result,
    error,
    mutate,
    isLoading,
  } = useSWR(shouldFetch ? `/user/contests/${contestId}/self-tests/${selfTestId}` : null, fetcher, {
    refreshInterval: 0, // 我们手动控制轮询
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // 开始轮询
  const startPolling = () => {
    if (!selfTestId || isPolling) return;

    setIsPolling(true);
    setAttempts(0);
    poll();
  };

  // 停止轮询
  const stopPolling = () => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 轮询逻辑
  const poll = async () => {
    if (!selfTestId || attempts >= maxAttempts) {
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

  // 判断自测是否完成
  const isSelfTestComplete = (result: SelfTestData): boolean => {
    return result.isCompiled !== undefined;
  };

  // 处理结果变化
  useEffect(() => {
    if (!result) return;

    // 如果之前没有结果，现在有了，触发状态变更回调
    if (
      previousResultRef.current === null ||
      JSON.stringify(previousResultRef.current) !== JSON.stringify(result)
    ) {
      onStatusChange?.(result);
    }

    // 如果自测已完成，停止轮询
    if (isSelfTestComplete(result)) {
      stopPolling();
      onComplete?.(result);
    } else if (isPolling && attempts < maxAttempts) {
      // 继续轮询
      timeoutRef.current = setTimeout(poll, interval);
    }

    previousResultRef.current = result;
  }, [result, attempts, maxAttempts, interval, isPolling, onStatusChange, onComplete]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    result,
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

// 简化版本的 hook，用于单次提交状态检查
export function useSubmissionStatus(submissionId?: string, contestId?: number) {
  return useSubmissionPolling({
    submissionId,
    contestId,
    enabled: !!submissionId && !!contestId,
    interval: 2000,
    maxAttempts: 150,
  });
}

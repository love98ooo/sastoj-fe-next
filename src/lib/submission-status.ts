export enum SubmissionStatus {
  Invalid = 0,
  Accepted = 1,
  CompileError = 2,
  WrongAnswer = 3,
  PresentationError = 4,
  RuntimeError = 5,
  TimeLimitExceeded = 6,
  MemoryLimitExceeded = 7,
  OutputLimitExceeded = 8,
  Waiting = 9,
  Judging = 10,
  SystemError = 11,
  Unaccepted = 12,
}

export const SubmissionStatusLabels: Record<SubmissionStatus, string> = {
  [SubmissionStatus.Invalid]: '无效',
  [SubmissionStatus.Accepted]: '通过',
  [SubmissionStatus.CompileError]: '编译错误',
  [SubmissionStatus.WrongAnswer]: '答案错误',
  [SubmissionStatus.PresentationError]: '格式错误',
  [SubmissionStatus.RuntimeError]: '运行错误',
  [SubmissionStatus.TimeLimitExceeded]: '时间超限',
  [SubmissionStatus.MemoryLimitExceeded]: '内存超限',
  [SubmissionStatus.OutputLimitExceeded]: '输出超限',
  [SubmissionStatus.Waiting]: '等待中',
  [SubmissionStatus.Judging]: '评测中',
  [SubmissionStatus.SystemError]: '系统错误',
  [SubmissionStatus.Unaccepted]: '不通过',
};

export const SubmissionStatusEnglishLabels: Record<SubmissionStatus, string> = {
  [SubmissionStatus.Invalid]: 'Invalid',
  [SubmissionStatus.Accepted]: 'Accepted',
  [SubmissionStatus.CompileError]: 'Compile Error',
  [SubmissionStatus.WrongAnswer]: 'Wrong Answer',
  [SubmissionStatus.PresentationError]: 'Presentation Error',
  [SubmissionStatus.RuntimeError]: 'Runtime Error',
  [SubmissionStatus.TimeLimitExceeded]: 'Time Limit Exceeded',
  [SubmissionStatus.MemoryLimitExceeded]: 'Memory Limit Exceeded',
  [SubmissionStatus.OutputLimitExceeded]: 'Output Limit Exceeded',
  [SubmissionStatus.Waiting]: 'Waiting',
  [SubmissionStatus.Judging]: 'Judging',
  [SubmissionStatus.SystemError]: 'System Error',
  [SubmissionStatus.Unaccepted]: 'Unaccepted',
};

// 状态颜色映射
export const SubmissionStatusColors: Record<
  SubmissionStatus,
  {
    bg: string;
    text: string;
    hover: string;
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
  }
> = {
  [SubmissionStatus.Invalid]: {
    bg: 'bg-gray-100 dark:bg-gray-800/80',
    text: 'text-gray-700 dark:text-gray-300',
    hover:
      'hover:bg-gray-200 dark:hover:bg-gray-700/90 hover:text-gray-800 dark:hover:text-gray-200',
    variant: 'secondary',
  },
  [SubmissionStatus.Accepted]: {
    bg: 'bg-green-100 dark:bg-green-900/80',
    text: 'text-green-700 dark:text-green-300',
    hover:
      'hover:bg-green-200 dark:hover:bg-green-800/90 hover:text-green-800 dark:hover:text-green-200',
    variant: 'default',
  },
  [SubmissionStatus.CompileError]: {
    bg: 'bg-red-100 dark:bg-red-900/80',
    text: 'text-red-700 dark:text-red-300',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/90 hover:text-red-800 dark:hover:text-red-200',
    variant: 'destructive',
  },
  [SubmissionStatus.WrongAnswer]: {
    bg: 'bg-red-100 dark:bg-red-900/80',
    text: 'text-red-700 dark:text-red-300',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/90 hover:text-red-800 dark:hover:text-red-200',
    variant: 'destructive',
  },
  [SubmissionStatus.PresentationError]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/80',
    text: 'text-yellow-700 dark:text-yellow-300',
    hover:
      'hover:bg-yellow-200 dark:hover:bg-yellow-800/90 hover:text-yellow-800 dark:hover:text-yellow-200',
    variant: 'outline',
  },
  [SubmissionStatus.RuntimeError]: {
    bg: 'bg-red-100 dark:bg-red-900/80',
    text: 'text-red-700 dark:text-red-300',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/90 hover:text-red-800 dark:hover:text-red-200',
    variant: 'destructive',
  },
  [SubmissionStatus.TimeLimitExceeded]: {
    bg: 'bg-orange-100 dark:bg-orange-900/80',
    text: 'text-orange-700 dark:text-orange-300',
    hover:
      'hover:bg-orange-200 dark:hover:bg-orange-800/90 hover:text-orange-800 dark:hover:text-orange-200',
    variant: 'outline',
  },
  [SubmissionStatus.MemoryLimitExceeded]: {
    bg: 'bg-orange-100 dark:bg-orange-900/80',
    text: 'text-orange-700 dark:text-orange-300',
    hover:
      'hover:bg-orange-200 dark:hover:bg-orange-800/90 hover:text-orange-800 dark:hover:text-orange-200',
    variant: 'outline',
  },
  [SubmissionStatus.OutputLimitExceeded]: {
    bg: 'bg-purple-100 dark:bg-purple-900/80',
    text: 'text-purple-700 dark:text-purple-300',
    hover:
      'hover:bg-purple-200 dark:hover:bg-purple-800/90 hover:text-purple-800 dark:hover:text-purple-200',
    variant: 'outline',
  },
  [SubmissionStatus.Waiting]: {
    bg: 'bg-blue-100 dark:bg-blue-900/80',
    text: 'text-blue-700 dark:text-blue-300',
    hover:
      'hover:bg-blue-200 dark:hover:bg-blue-800/90 hover:text-blue-800 dark:hover:text-blue-200',
    variant: 'secondary',
  },
  [SubmissionStatus.Judging]: {
    bg: 'bg-blue-100 dark:bg-blue-900/80',
    text: 'text-blue-700 dark:text-blue-300',
    hover:
      'hover:bg-blue-200 dark:hover:bg-blue-800/90 hover:text-blue-800 dark:hover:text-blue-200',
    variant: 'secondary',
  },
  [SubmissionStatus.SystemError]: {
    bg: 'bg-gray-100 dark:bg-gray-800/80',
    text: 'text-gray-700 dark:text-gray-300',
    hover:
      'hover:bg-gray-200 dark:hover:bg-gray-700/90 hover:text-gray-800 dark:hover:text-gray-200',
    variant: 'secondary',
  },
  [SubmissionStatus.Unaccepted]: {
    bg: 'bg-red-100 dark:bg-red-900/80',
    text: 'text-red-700 dark:text-red-300',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/90 hover:text-red-800 dark:hover:text-red-200',
    variant: 'destructive',
  },
};

// 判断状态是否需要轮询
export function isStatusPending(status: SubmissionStatus): boolean {
  return status === SubmissionStatus.Waiting || status === SubmissionStatus.Judging;
}

// 判断状态是否为最终状态
export function isStatusFinal(status: SubmissionStatus): boolean {
  return !isStatusPending(status);
}

// 判断状态是否为通过
export function isStatusAccepted(status: SubmissionStatus): boolean {
  return status === SubmissionStatus.Accepted;
}

// 判断状态是否为错误状态
export function isStatusError(status: SubmissionStatus): boolean {
  return [
    SubmissionStatus.CompileError,
    SubmissionStatus.WrongAnswer,
    SubmissionStatus.PresentationError,
    SubmissionStatus.RuntimeError,
    SubmissionStatus.TimeLimitExceeded,
    SubmissionStatus.MemoryLimitExceeded,
    SubmissionStatus.OutputLimitExceeded,
    SubmissionStatus.Unaccepted,
  ].includes(status);
}

// 判断状态是否为系统相关状态（无效、系统错误等）
export function isStatusSystem(status: SubmissionStatus): boolean {
  return [SubmissionStatus.Invalid, SubmissionStatus.SystemError].includes(status);
}

// 获取状态显示信息
export function getStatusInfo(status: SubmissionStatus, useEnglish = false) {
  const label = useEnglish ? SubmissionStatusEnglishLabels[status] : SubmissionStatusLabels[status];
  const colors = SubmissionStatusColors[status];

  return {
    label,
    ...colors,
    isPending: isStatusPending(status),
    isFinal: isStatusFinal(status),
    isAccepted: isStatusAccepted(status),
    isError: isStatusError(status),
    isSystem: isStatusSystem(status),
  };
}

// API 状态映射工具函数
/**
 * 确保状态值在枚举范围内
 */
export function mapApiStateToSubmissionStatus(state: number): SubmissionStatus {
  if (state >= 0 && state <= 12 && Object.values(SubmissionStatus).includes(state)) {
    return state as SubmissionStatus;
  }
  return SubmissionStatus.Invalid;
}

/**
 * 获取提交状态（统一处理不同的状态字段名）
 */
export function getSubmissionStatus(submission: {
  state?: number;
  status?: number;
}): SubmissionStatus {
  // 处理 state 可能为 undefined 的情况，优先使用 state，然后是 status
  const state = submission.state ?? submission.status ?? 0;
  return mapApiStateToSubmissionStatus(state);
}

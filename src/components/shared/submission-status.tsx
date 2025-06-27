'use client';

import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { SubmissionStatus, getStatusInfo } from '@/lib/submission-status';
import { cn } from '@/lib/utils';

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  useEnglish?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function SubmissionStatusBadge({
  status,
  useEnglish = false,
  className,
  showIcon = true,
}: SubmissionStatusBadgeProps) {
  const statusInfo = getStatusInfo(status, useEnglish);

  const getStatusIcon = () => {
    if (!showIcon) return null;

    const iconClass = 'w-3 h-3 mr-1';

    if (statusInfo.isPending) {
      return <Loader2 className={cn(iconClass, 'animate-spin')} />;
    }

    if (statusInfo.isAccepted) {
      return <CheckCircle className={iconClass} />;
    }

    if (statusInfo.isError) {
      return <XCircle className={iconClass} />;
    }

    if (statusInfo.isSystem) {
      return <AlertTriangle className={iconClass} />;
    }

    return <AlertTriangle className={iconClass} />;
  };

  return (
    <Badge className={cn(
      'flex items-center transition-all duration-200 cursor-default',
      statusInfo.bg,
      statusInfo.text,
      statusInfo.hover,
      className
    )}>
      {getStatusIcon()}
      {statusInfo.label}
    </Badge>
  );
}

interface SubmissionStatusIndicatorProps {
  status: SubmissionStatus;
  score?: number;
  timeUsed?: number;
  memoryUsed?: number;
  useEnglish?: boolean;
  className?: string;
}

export function SubmissionStatusIndicator({
  status,
  score,
  timeUsed,
  memoryUsed,
  useEnglish = false,
  className,
}: SubmissionStatusIndicatorProps) {
  const statusInfo = getStatusInfo(status, useEnglish);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SubmissionStatusBadge status={status} useEnglish={useEnglish} />

      {score !== undefined && (
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          分数: <span className="text-gray-800 dark:text-gray-200">{score}</span>
        </span>
      )}

      {timeUsed !== undefined && (
        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3" />
          <span className="text-gray-800 dark:text-gray-200">{timeUsed}ms</span>
        </span>
      )}

      {memoryUsed !== undefined && (
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          <span className="text-gray-800 dark:text-gray-200">{memoryUsed}KB</span>
        </span>
      )}
    </div>
  );
}

interface PendingSubmissionIndicatorProps {
  status: SubmissionStatus;
  message?: string;
  className?: string;
}

export function PendingSubmissionIndicator({
  status,
  message,
  className,
}: PendingSubmissionIndicatorProps) {
  const statusInfo = getStatusInfo(status);

  if (!statusInfo.isPending) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-md transition-all duration-200',
        'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800',
        'hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700',
        className
      )}
    >
      <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
      <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
        {message || `正在${statusInfo.label}...`}
      </span>
    </div>
  );
}

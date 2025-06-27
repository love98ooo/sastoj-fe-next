import { Badge } from '@/components/ui/badge';
import { SubmissionStatusIndicator } from '@/components/shared/submission-status';
import { SubmissionStatus, getSubmissionStatus } from '@/lib/submission-status';
import { Submission } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface SubmissionsPanelProps {
  submissions: Submission[];
  onSubmissionClick: (submission: Submission) => void;
}

export function SubmissionsPanel({ submissions, onSubmissionClick }: SubmissionsPanelProps) {

  return (
    <div className="mt-4 h-[calc(100vh-140px)] overflow-y-auto pr-2">
      <div className="space-y-3">
        {submissions && submissions.length > 0 ? (
          submissions.map(submission => (
            <div
              key={submission.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-all hover:shadow-sm"
              onClick={() => onSubmissionClick(submission)}
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400 font-medium">
                  #{submission.id}
                </span>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {submission.language}
                </Badge>
                <SubmissionStatusIndicator status={getSubmissionStatus(submission)} />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {formatDate(submission.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>暂无提交记录</p>
          </div>
        )}
      </div>
    </div>
  );
} 
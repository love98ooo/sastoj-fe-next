import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeEditor, SUPPORTED_LANGUAGES } from '@/components/shared/code-editor';
import { PendingSubmissionIndicator } from '@/components/shared/submission-status';
import { SubmissionStatus, getSubmissionStatus } from '@/lib/submission-status';
import { Submission } from '@/lib/api';

interface CodeEditorPanelProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  isSubmissionPolling: boolean;
  latestSubmission?: Submission | null;
}

export function CodeEditorPanel({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  isSubmissionPolling,
  latestSubmission
}: CodeEditorPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b bg-background flex-shrink-0">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择语言" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <CodeEditor language={language} value={code} onChange={onCodeChange} />
      </div>

      {isSubmissionPolling && latestSubmission && (
        <div className="border-t p-4 flex-shrink-0">
          <PendingSubmissionIndicator
            status={getSubmissionStatus(latestSubmission)}
            message={`正在评测提交 #${latestSubmission.id}...`}
          />
        </div>
      )}
    </div>
  );
} 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { SubmissionStatusIndicator } from '@/components/shared/submission-status';
import { SubmissionStatus, mapApiStateToSubmissionStatus } from '@/lib/submission-status';
import { formatDate } from '@/lib/utils';
import { Submission, SubmissionDetail, TestCase } from '@/lib/api';
import { useToast } from '@/hooks';



// 语言映射表，将提交语言映射到高亮库使用的语言标识符
const languageHighlightMap: Record<string, string> = {
  C: 'c',
  'C++': 'cpp',
  'C++98': 'cpp',
  'C++11': 'cpp',
  'C++11(O2)': 'cpp',
  'C++14': 'cpp',
  'C++14(O2)': 'cpp',
  'C++17': 'cpp',
  'C++17(O2)': 'cpp',
  Golang: 'go',
  Java: 'java',
  Python3: 'python',
  Python2: 'python',
  NodeJS: 'javascript',
  Ruby: 'ruby',
  PHP: 'php',
  Bash: 'bash',
};

// 获取代码高亮使用的语言
const getHighlightLanguage = (language: string): string => {
  return languageHighlightMap[language] || 'text';
};

interface SubmissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubmission: Submission | null;
  submissionDetail: SubmissionDetail | null;
  isLoading: boolean;
}

export function SubmissionDetailModal({
  open,
  onOpenChange,
  selectedSubmission,
  submissionDetail,
  isLoading
}: SubmissionDetailModalProps) {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();



  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      toast({
        variant: 'success',
        title: '复制成功',
        description: '内容已复制到剪贴板',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: '复制失败',
        description: '无法复制到剪贴板',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[60vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>提交详情 #{selectedSubmission?.id}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">正在加载提交详情...</div>
          ) : (
            submissionDetail &&
            selectedSubmission && (
              <div className="space-y-6">
                {/* 提交基本信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">语言</label>
                    <div className="text-sm font-mono">{submissionDetail.language}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">得分</label>
                    <div className="text-sm font-mono">{submissionDetail.point} 分</div>
                  </div>
                  {submissionDetail.totalTime && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        执行时间
                      </label>
                      <div className="text-sm font-mono">
                        {Math.round(submissionDetail.totalTime / 1000000)}ms
                      </div>
                    </div>
                  )}
                  {submissionDetail.maxMemory && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        内存使用
                      </label>
                      <div className="text-sm font-mono">
                        {Math.round(submissionDetail.maxMemory / 1024)}KB
                      </div>
                    </div>
                  )}
                </div>

                {/* 提交状态 */}
                {submissionDetail?.state !== undefined && (
                  <div className="flex items-center gap-2">
                    <SubmissionStatusIndicator
                      status={mapApiStateToSubmissionStatus(submissionDetail.state)}
                    />
                  </div>
                )}

                {/* 代码部分 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold">代码</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => copyToClipboard(submissionDetail.code || '')}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs">复制代码</span>
                    </Button>
                  </div>
                  <div className="bg-muted rounded-md overflow-hidden border">
                    <SyntaxHighlighter
                      language={getHighlightLanguage(submissionDetail.language)}
                      style={resolvedTheme === 'dark' ? oneDark : oneLight}
                      showLineNumbers
                      wrapLines
                      customStyle={{
                        margin: 0,
                        maxHeight: '400px',
                        overflow: 'auto',
                        fontSize: '13px',
                      }}
                    >
                      {submissionDetail.code || '// 代码内容暂不可用'}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {/* 测试点详情 */}
                <div>
                  <h3 className="text-base font-semibold mb-3">测试点详情</h3>
                  {submissionDetail.testCases.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      <TooltipProvider>
                        {submissionDetail.testCases.map(testCase => {
                          // 将纳秒转换为毫秒
                          const timeInMs = Math.round(parseInt(testCase.time) / 1000000);
                          // 将字节转换为KB
                          const memoryInKB = Math.round(parseInt(testCase.memory) / 1024);
                          const isPassed = testCase.state === 1;

                          return (
                            <Tooltip key={testCase.index}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`flex flex-col justify-center items-center border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                                    isPassed
                                      ? 'bg-green-50 border-green-200 hover:bg-green-100/70 dark:bg-green-900/20 dark:border-green-800/60 dark:hover:bg-green-900/30'
                                      : 'bg-red-50 border-red-200 hover:bg-red-100/70 dark:bg-red-900/20 dark:border-red-800/60 dark:hover:bg-red-900/30'
                                  }`}
                                >
                                  <div className="text-lg font-medium dark:text-foreground">
                                    #{testCase.index + 1}
                                  </div>
                                  <div
                                    className={`text-xs font-medium ${
                                      isPassed
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-red-700 dark:text-red-400'
                                    }`}
                                  >
                                    {testCase.point} 分
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {timeInMs}ms
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-80 p-0 dark:bg-slate-800 dark:border-slate-700"
                              >
                                <div
                                  className={`p-3 space-y-2.5 border-l-4 ${
                                    isPassed
                                      ? 'border-l-green-500 dark:border-l-green-500'
                                      : 'border-l-red-500 dark:border-l-red-500'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium dark:text-slate-200">
                                      测试点 #{testCase.index + 1}
                                    </span>
                                    <span
                                      className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                                        isPassed
                                          ? 'bg-green-100 text-green-700 dark:bg-green-800/70 dark:text-green-200'
                                          : 'bg-red-100 text-red-700 dark:bg-red-800/70 dark:text-red-200'
                                      }`}
                                    >
                                      {isPassed ? '通过' : '未通过'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs text-muted-foreground dark:text-slate-400">
                                        得分
                                      </div>
                                      <div className="font-medium dark:text-slate-200">
                                        {testCase.point} 分
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground dark:text-slate-400">
                                        执行时间
                                      </div>
                                      <div className="font-medium dark:text-slate-200">
                                        {timeInMs} ms
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground dark:text-slate-400">
                                        内存使用
                                      </div>
                                      <div className="font-medium dark:text-slate-200">
                                        {memoryInKB} KB
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground dark:text-slate-400">
                                        状态
                                      </div>
                                      <div
                                        className={`font-medium ${
                                          isPassed
                                            ? 'text-green-600 dark:text-green-300'
                                            : 'text-red-600 dark:text-red-300'
                                        }`}
                                      >
                                        {isPassed ? '通过' : '未通过'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">暂无测试点详情</p>
                      <p className="text-xs mt-1">测试点信息可能在评测完成后显示</p>
                    </div>
                  )}
                </div>

                {/* 提交时间信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">提交时间</label>
                    <div className="text-sm">{formatDate(submissionDetail.createdAt)}</div>
                  </div>
                  {submissionDetail.updatedAt && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        更新时间
                      </label>
                      <div className="text-sm">{formatDate(submissionDetail.updatedAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
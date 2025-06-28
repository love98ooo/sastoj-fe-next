import { SelfTestResult } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';

interface SelfTestResultPanelProps {
  result: SelfTestResult | null;
  isLoading: boolean;
  customTestInput: string;
}

// Utility functions to derive display properties from API data
function getDisplayOutput(result: SelfTestResult): string {
  if (!result.isCompiled) {
    return result.complieMsg || '编译失败';
  }
  if (result.stderr && result.stderr.trim()) {
    return result.stderr;
  }
  return result.stdout || '执行成功';
}

function getSuccess(result: SelfTestResult): boolean {
  return result.isCompiled && (!result.stderr || !result.stderr.trim());
}

function getVerdict(result: SelfTestResult): string {
  if (!result.isCompiled) {
    return 'Compile Error';
  }
  if (result.stderr && result.stderr.trim()) {
    return 'Runtime Error';
  }
  return 'Accepted';
}

export function SelfTestResultPanel({
  result,
  isLoading,
  customTestInput,
}: SelfTestResultPanelProps) {
  const success = result ? getSuccess(result) : false;
  const output = result ? getDisplayOutput(result) : '';
  const executionTime = result ? `${Math.round(result.time / 1000000)}ms` : '';
  const memory = result ? formatFileSize(result.memory) : '';
  const stderr = result?.stderr;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">正在执行自测...</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* 状态和性能指标在顶部 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg border ${
              success
                ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/60'
                : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${success ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm font-medium">
                {success ? '运行成功' : '运行失败'}
              </span>
            </div>

            {/* 执行时间和内存占用 - 紧凑显示 */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">时间:</span>
                <span className="font-mono font-medium">{executionTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">内存:</span>
                <span className="font-mono font-medium">{memory}</span>
              </div>
            </div>
          </div>

          {/* 输入输出部分 - 左右布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左侧 - 输入 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">输入</label>
              <pre className="text-xs bg-muted p-3 rounded border font-mono whitespace-pre-wrap h-[calc(100%-24px)]">
                {customTestInput}
              </pre>
            </div>

            {/* 右侧 - 输出和错误信息 */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">输出</label>
                <pre className="text-xs bg-muted p-3 rounded border font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </div>

              {stderr && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    错误信息
                  </label>
                  <pre className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded font-mono whitespace-pre-wrap text-red-800 dark:text-red-300">
                    {stderr}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>暂无自测结果</p>
          <p className="mt-2 text-xs">
            在测试用例标签页输入代码和测试数据，然后点击&ldquo;自测&rdquo;按钮
          </p>
        </div>
      )}
    </div>
  );
}

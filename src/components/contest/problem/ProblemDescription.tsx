import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks';

interface ProblemContent {
  description: string;
  input?: string;
  output?: string;
  examples?: {
    input: string;
    output: string;
  }[];
  constraints?: {
    text: string;
  }[];
}

interface ProblemDescriptionProps {
  content: ProblemContent;
  rawContent?: string;
}

export function ProblemDescription({ content, rawContent }: ProblemDescriptionProps) {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      toast({
        variant: 'success',
        title: '复制成功',
        description: '内容已复制到剪贴板',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: '复制失败',
        description: '无法复制到剪贴板',
      });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto space-y-6 pr-2">
      {/* Problem Description */}
      <div className="prose prose-sm max-w-none">
        <MarkdownRenderer content={content.description || rawContent || '暂无题目描述。'} />
      </div>

      {/* Input Format */}
      {content.input && (
        <div>
          <h4 className="font-semibold mb-3 text-foreground text-base">输入格式</h4>
          <div className="bg-muted p-4 rounded-lg text-sm border">
            <MarkdownRenderer content={content.input} />
          </div>
        </div>
      )}

      {/* Output Format */}
      {content.output && (
        <div>
          <h4 className="font-semibold mb-3 text-foreground text-base">输出格式</h4>
          <div className="bg-muted p-4 rounded-lg text-sm border">
            <MarkdownRenderer content={content.output} />
          </div>
        </div>
      )}

      {/* Examples */}
      {content.examples && content.examples.length > 0 && (
        <div className="space-y-4">
          {content.examples.map((example, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-2 text-foreground text-base">样例 {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">输入</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(example.input)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-sm text-foreground whitespace-pre-wrap">{example.input}</pre>
                </div>
                <div className="bg-muted p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">输出</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(example.output)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-sm text-foreground whitespace-pre-wrap">
                    {example.output}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {content.constraints && content.constraints.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-foreground text-base">数据范围与提示</h4>
          <div className="bg-muted p-4 rounded-lg border text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {content.constraints.map((constraint, index) => (
                <li key={index} className="text-muted-foreground">
                  {constraint.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

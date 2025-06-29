import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeEditor } from '@/components/shared/code-editor';
import { SelfTestResultPanel } from './SelfTestResultPanel';
import { SelfTestResult } from '@/lib/api';

interface TestCasesPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  customTestInput: string;
  setCustomTestInput: (input: string) => void;
  selfTestResult: SelfTestResult | null;
  isSelfTesting: boolean;
  isSelfTestPolling: boolean;
}

export function TestCasesPanel({
  activeTab,
  setActiveTab,
  customTestInput,
  setCustomTestInput,
  selfTestResult,
  isSelfTesting,
  isSelfTestPolling,
}: TestCasesPanelProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full h-full flex flex-col gap-0"
    >
      <div className="px-4 pt-3 pb-2 border-b flex-shrink-0">
        <TabsList className="grid w-full grid-cols-2 bg-card">
          <TabsTrigger value="test-cases" className="text-sm">
            测试用例
          </TabsTrigger>
          <TabsTrigger value="self-test-result" className="text-sm">
            自测结果
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="test-cases" className="flex-1 overflow-y-auto mt-0">
        <CodeEditor language="text" value={customTestInput} onChange={setCustomTestInput} />
      </TabsContent>

      <TabsContent value="self-test-result" className="flex-1 overflow-y-auto">
        <SelfTestResultPanel
          result={selfTestResult}
          isLoading={isSelfTesting || isSelfTestPolling}
          customTestInput={customTestInput}
        />
      </TabsContent>
    </Tabs>
  );
}

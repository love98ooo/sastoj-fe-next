'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useProblem,
  useSubmitCode,
  useContestSubmissions,
  useSelfTest,
  useSubmissionWithPolling,
  useSelfTestWithPolling,
  useContestProblems,
} from '@/hooks';
import { submissionApi, ApiError, SubmissionDetail, SelfTestResult } from '@/lib/api';
import { ContestProblemPageProps } from '@/lib/page-types';
import { getLanguageTemplate } from '@/components/shared/code-editor';
import {
  SubmissionStatus,
  SubmissionStatusLabels,
  getSubmissionStatus,
} from '@/lib/submission-status';
import { Submission } from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/hooks';
import { useUserCodeStore } from '@/lib/store';
import {
  ProblemDescription,
  CodeEditorPanel,
  SubmissionsPanel,
  SubmissionDetailModal,
  TestCasesPanel,
} from '@/components/contest/problem';
import { useRouter } from 'next/navigation';

export default function ContestProblemDetailPage({ params }: ContestProblemPageProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('C++');
  const [mounted, setMounted] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionDetail, setSubmissionDetail] = useState<SubmissionDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customTestInput, setCustomTestInput] = useState('');
  const [selfTestResult, setSelfTestResult] = useState<SelfTestResult | null>(null);
  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [selfTestUuid, setSelfTestUuid] = useState<string | null>(null);

  // Tab 状态控制
  const [activeTestTab, setActiveTestTab] = useState('test-cases');

  // 限流保护状态
  const [isSubmitCooldown, setIsSubmitCooldown] = useState(false);
  const [isSelfTestCooldown, setIsSelfTestCooldown] = useState(false);

  const { toast } = useToast();

  // 使用 React.use() 解包 params Promise
  const resolvedParams = use(params);
  const contestId = parseInt(resolvedParams.contestId);
  const problemId = parseInt(resolvedParams.problemId);

  const router = useRouter();

  // Use SWR hooks for data fetching
  const {
    data: problem,
    error: problemError,
    isLoading: problemLoading,
  } = useProblem(problemId, contestId);

  // 获取竞赛题目列表用于导航
  const { data: contestProblems } = useContestProblems(contestId);

  const { data: submissions, mutate: mutateSubmissions } = useContestSubmissions(
    contestId,
    problemId,
    {
      size: 10,
      current: 1,
    }
  );
  const { trigger: submitCode, isMutating: isSubmitting } = useSubmitCode();
  const { trigger: selfTest, isMutating: isSelfTestMutating } = useSelfTest();

  // 使用提交轮询 hook
  const {
    submission: latestSubmission,
    isPolling: isSubmissionPolling,
    startPolling: startSubmissionPolling,
  } = useSubmissionWithPolling(lastSubmissionId || undefined, contestId, {
    onComplete: submission => {
      // 刷新提交历史
      mutateSubmissions();

      // 显示提交完成的 toast
      const status = getSubmissionStatus(submission);
      if (status === SubmissionStatus.Accepted) {
        toast({
          variant: 'success',
          title: '提交成功',
          description: '恭喜！您的答案已通过！',
        });
      } else {
        toast({
          variant: 'destructive',
          title: '提交完成',
          description: `评测结果：${SubmissionStatusLabels[status]}`,
        });
      }
    },
  });

  // 使用自测轮询 hook
  const { isPolling: isSelfTestPolling, startPolling: startSelfTestPolling } =
    useSelfTestWithPolling(selfTestUuid || undefined, contestId, {
      onComplete: result => {
        setIsSelfTesting(false);

        if (!result.isCompiled) {
          // 编译失败
          setSelfTestResult({
            success: false,
            output: result.complieMsg || '编译失败',
            executionTime: `${Math.round(result.time / 1000000)}ms`,
            memory: `${Math.round(result.memory / 1024)}KB`,
            verdict: 'Compile Error',
            stderr: result.stderr,
          });
        } else if (result.stderr && result.stderr.trim()) {
          // 运行时错误
          setSelfTestResult({
            success: false,
            output: result.stderr,
            executionTime: `${Math.round(result.time / 1000000)}ms`,
            memory: `${Math.round(result.memory / 1024)}KB`,
            verdict: 'Runtime Error',
            stderr: result.stderr,
          });
        } else {
          // 执行成功
          setSelfTestResult({
            success: true,
            output: result.stdout || '执行成功',
            executionTime: `${Math.round(result.time / 1000000)}ms`,
            memory: `${Math.round(result.memory / 1024)}KB`,
            verdict: 'Accepted',
            stderr: result.stderr,
          });
        }
      },
    });

  // 使用用户代码存储
  const { getCode, saveCode, getLastLanguage, saveLastLanguage } = useUserCodeStore();

  const parseProblemContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return {
        description: content,
        input: '',
        output: '',
        examples: [],
        constraints: [],
      };
    }
  };

  const handleSelfTest = async () => {
    if (isSelfTestCooldown) {
      toast({
        variant: 'warning',
        title: '操作频繁',
        description: '请稍等，操作过于频繁！',
      });
      return;
    }

    // 启动自测冷却期
    setIsSelfTestCooldown(true);
    setTimeout(() => {
      setIsSelfTestCooldown(false);
    }, 3000);

    setIsSelfTesting(true);
    setSelfTestResult(null);

    try {
      const uuid = await selfTest({
        problem_id: problemId,
        contest_id: contestId,
        code,
        language,
        input: customTestInput,
      });

      if (uuid) {
        setActiveTestTab('self-test-result');
        setSelfTestUuid(uuid);
      }
    } catch (error) {
      if (error instanceof ApiError && error.message.includes('rate Limit Exceeded')) {
        setSelfTestResult({
          success: false,
          output: '操作过于频繁，请稍后再试！',
          executionTime: '0ms',
          memory: '0KB',
        });
      } else {
        setSelfTestResult({
          success: false,
          output: '自测提交失败: ' + (error as Error).message,
          executionTime: '0ms',
          memory: '0KB',
        });
      }
      setIsSelfTesting(false);
    }
  };

  const handleSubmissionClick = async (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsLoadingDetail(true);
    setShowDetailModal(true);

    try {
      const [detail, casesResponse] = await Promise.all([
        submissionApi.getSubmissionDetail(contestId, submission.id),
        submissionApi.getSubmissionCases(contestId, submission.id).catch(() => ({ cases: [] })), // 如果获取失败，返回空数组
      ]);

      setSubmissionDetail({
        code: detail.code,
        language: detail.language,
        point: detail.point,
        state: detail.state,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        totalTime: detail.totalTime,
        maxMemory: detail.maxMemory,
        testCases: casesResponse.cases || [],
      });
      setIsLoadingDetail(false);
    } catch {
      setIsLoadingDetail(false);
    }
  };

  // 处理用户编辑的代码
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveCode(contestId, problemId, language, newCode);
  };

  // 处理语言变更
  const handleLanguageChange = (newLanguage: string) => {
    saveLastLanguage(contestId, problemId, newLanguage);
    setLanguage(newLanguage);

    // 获取该语言的已保存代码或默认模板
    const savedCode = getCode(contestId, problemId, newLanguage);
    if (savedCode) {
      setCode(savedCode);
    } else {
      // 加载语言模板
      const template = getLanguageTemplate(newLanguage);
      setCode(template);
      // 同时保存模板到 store
      saveCode(contestId, problemId, newLanguage, template);
    }
  };

  useEffect(() => {
    if (mounted && contestId && problemId) {
      // 加载上次使用的语言，如果有的话
      const lastUsedLanguage = getLastLanguage(contestId, problemId);
      if (lastUsedLanguage) {
        setLanguage(lastUsedLanguage);

        // 加载该语言对应的代码
        const savedCode = getCode(contestId, problemId, lastUsedLanguage);
        if (savedCode) {
          setCode(savedCode);
        } else {
          // 如果没有保存的代码，则加载默认模板
          const template = getLanguageTemplate(lastUsedLanguage);
          setCode(template);
          // 同时保存模板到 store
          saveCode(contestId, problemId, lastUsedLanguage, template);
        }
      } else {
        // 没有上次使用的语言记录，使用默认语言和模板
        const template = getLanguageTemplate(language);
        setCode(template);
        saveCode(contestId, problemId, language, template);
        saveLastLanguage(contestId, problemId, language);
      }
    }
  }, [mounted, contestId, problemId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听提交ID变化，自动启动提交轮询
  useEffect(() => {
    if (lastSubmissionId) {
      startSubmissionPolling();
    }
  }, [lastSubmissionId]);

  // 监听自测ID变化，自动启动自测轮询
  useEffect(() => {
    if (selfTestUuid) {
      startSelfTestPolling();
    }
  }, [selfTestUuid]);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只有在没有焦点在输入框时才处理键盘事件
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true');

      if (isInputFocused) return;

      const currentNavigationInfo = getNavigationInfo();

      if (event.key === 'ArrowLeft' && currentNavigationInfo.prevProblem) {
        event.preventDefault();
        navigateToProblem(currentNavigationInfo.prevProblem.id);
      } else if (event.key === 'ArrowRight' && currentNavigationInfo.nextProblem) {
        event.preventDefault();
        navigateToProblem(currentNavigationInfo.nextProblem.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [contestProblems, problemId]);

  // 题目导航相关功能
  const getSortedProblems = () => {
    if (!contestProblems) return [];
    return [...contestProblems].sort((a, b) => a.index - b.index);
  };

  const getCurrentProblemIndex = () => {
    const sortedProblems = getSortedProblems();
    return sortedProblems.findIndex(p => p.id === problemId);
  };

  const getNavigationInfo = () => {
    const sortedProblems = getSortedProblems();
    const currentIndex = getCurrentProblemIndex();

    return {
      currentIndex,
      total: sortedProblems.length,
      prevProblem: currentIndex > 0 ? sortedProblems[currentIndex - 1] : null,
      nextProblem:
        currentIndex >= 0 && currentIndex < sortedProblems.length - 1
          ? sortedProblems[currentIndex + 1]
          : null,
      currentProblemLabel: currentIndex >= 0 ? String.fromCharCode(65 + currentIndex) : '',
      displayIndex: currentIndex >= 0 ? currentIndex + 1 : 0,
    };
  };

  const navigateToProblem = (targetProblemId: number) => {
    router.push(`/contest/${contestId}/problem/${targetProblemId}`);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        variant: 'warning',
        title: '提交失败',
        description: '请先编写代码再提交！',
      });
      return;
    }

    if (isSubmitCooldown) {
      toast({
        variant: 'warning',
        title: '操作频繁',
        description: '请稍等，操作过于频繁！',
      });
      return;
    }

    // 启动提交冷却期
    setIsSubmitCooldown(true);
    setTimeout(() => {
      setIsSubmitCooldown(false);
    }, 3000);

    try {
      const result = await submitCode({
        problem_id: problemId,
        contest_id: contestId,
        code,
        language,
      });

      if (result?.uuid) {
        // 新的 API 返回 uuid 字符串而不是数字 id
        setLastSubmissionId(result.uuid);
      }
    } catch (error) {
      if (error instanceof ApiError && error.message.includes('rate Limit Exceeded')) {
        toast({
          variant: 'destructive',
          title: '限流保护',
          description: '操作过于频繁，请稍后再试！',
        });
      } else {
        toast({
          variant: 'destructive',
          title: '提交失败',
          description: '提交失败，请重试。',
        });
      }
    }
  };

  if (problemLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (problemError || !problem) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">题目未找到</h2>
          <p className="text-gray-600">您查找的题目不存在或加载失败。</p>
          <Link href={`/contest/${contestId}/problems`} className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回题目列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const contentData = parseProblemContent(problem.content || '');
  const navigationInfo = getNavigationInfo();

  if (!mounted) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-2 border-b bg-background flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/contest/${contestId}/problems`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-border" />

          {/* 题目导航按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigationInfo.prevProblem && navigateToProblem(navigationInfo.prevProblem.id)
              }
              disabled={!navigationInfo.prevProblem || !contestProblems}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigationInfo.nextProblem && navigateToProblem(navigationInfo.nextProblem.id)
              }
              disabled={!navigationInfo.nextProblem || !contestProblems}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />
          <h1 className="text-lg font-medium text-foreground">{problem.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="px-6 py-1.5 text-sm font-medium"
            onClick={handleSelfTest}
            disabled={
              isSelfTesting ||
              isSelfTestMutating ||
              isSelfTestCooldown ||
              !code.trim() ||
              !customTestInput.trim()
            }
          >
            {isSelfTesting || isSelfTestMutating
              ? '自测中...'
              : isSelfTestCooldown
                ? '请稍等...'
                : '自测'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitCooldown || !code.trim()}
            size="sm"
            className="px-6 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
          >
            {isSubmitting ? '提交中...' : isSubmitCooldown ? '请稍等...' : '提交'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {problem.difficulty && (
            <Badge variant="outline" className="text-xs">
              {problem.difficulty}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {problem.score || 100} 分
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={30} maxSize={70} className="flex flex-col">
            <div className="px-6 py-3 border-b flex-shrink-0">
              <Tabs defaultValue="description" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger value="description" className="text-sm">
                    题目描述
                  </TabsTrigger>
                  <TabsTrigger value="submissions" className="text-sm">
                    提交记录
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description">
                  <ProblemDescription content={contentData} rawContent={problem.content} />
                </TabsContent>

                <TabsContent value="submissions">
                  <SubmissionsPanel
                    submissions={submissions || []}
                    onSubmissionClick={handleSubmissionClick}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </Panel>

          <PanelResizeHandle className="w-px bg-border data-[resize-handle-state=hover]:bg-blue-500 data-[resize-handle-state=drag]:bg-blue-500 transition-colors" />

          <Panel defaultSize={50} minSize={30} maxSize={70}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30} className="flex flex-col">
                <CodeEditorPanel
                  code={code}
                  language={language}
                  onCodeChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  isSubmissionPolling={isSubmissionPolling}
                  latestSubmission={latestSubmission}
                />
              </Panel>
              <PanelResizeHandle className="h-px bg-border data-[resize-handle-state=hover]:bg-blue-500 data-[resize-handle-state=drag]:bg-blue-500 transition-colors" />
              <Panel defaultSize={40} minSize={10} className="flex flex-col">
                <TestCasesPanel
                  activeTab={activeTestTab}
                  setActiveTab={setActiveTestTab}
                  customTestInput={customTestInput}
                  setCustomTestInput={setCustomTestInput}
                  selfTestResult={selfTestResult}
                  isSelfTesting={isSelfTesting}
                  isSelfTestPolling={isSelfTestPolling}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <SubmissionDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        selectedSubmission={selectedSubmission}
        submissionDetail={submissionDetail}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}

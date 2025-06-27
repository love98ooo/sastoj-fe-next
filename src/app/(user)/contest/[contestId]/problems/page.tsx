'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useContestProblems } from '@/hooks';
import Link from 'next/link';

export default function ContestProblemsPage() {
  const params = useParams();
  const contestId = parseInt(params.contestId as string);

  const {
    data: problems,
    error: problemsError,
    isLoading: problemsLoading,
  } = useContestProblems(contestId);

  if (problemsLoading) {
    return <div className="flex items-center justify-center h-64">加载题目中...</div>;
  }

  if (problemsError || !problems) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">加载题目失败</h3>
        <p className="text-gray-600">
          {problemsError?.message?.includes('403') || problemsError?.message?.includes('Forbidden')
            ? '您可能需要加入比赛才能查看题目。'
            : '无法获取比赛题目。'}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">题目</h2>
          <p className="text-gray-600">
            共 {problems.length} 题{problems.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {problems.map((problem, index) => (
          <Card key={problem.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {String.fromCharCode(65 + index)}. {problem.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {problem.type}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">{problem.score} 分</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">题目 #{problem.index}</span>
                <Link href={`/contest/${contestId}/problem/${problem.id}`}>
                  <Button size="sm">开始答题</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {problems.length === 0 && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">比赛没有题目</h3>
            <p className="text-gray-600">比赛可能还没有题目</p>
          </div>
        )}
      </div>
    </div>
  );
}

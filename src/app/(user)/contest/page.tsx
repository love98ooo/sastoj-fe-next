'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Trophy, UserPlus, TimerOff } from 'lucide-react';
import { useUserContests, useJoinContest } from '@/hooks';
import { useRouter } from 'next/navigation';
import { getContestTypeName } from '@/lib/contest-types';
import { useContestStore } from '@/lib/store';

export default function ContestPage() {
  const [mounted, setMounted] = useState(false);

  const { data: contests, error: contestsError, isLoading: contestsLoading } = useUserContests();
  const { trigger: joinContest } = useJoinContest();
  const router = useRouter();
  const { setContest } = useContestStore();

  // Set mounted to true on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const getContestStatus = (contest: { startTime: string; endTime: string }) => {
    if (!mounted) {
      return {
        status: 'loading',
        color:
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700',
      };
    }

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) {
      return {
        status: 'upcoming',
        color:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800',
      };
    } else if (now > endTime) {
      return {
        status: 'ended',
        color:
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700',
      };
    } else {
      return {
        status: 'running',
        color:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800',
      };
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) {
      return 'Loading...';
    }

    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleEnterContest = async (contestId: string) => {
    try {
      await joinContest({ contestId, isJoin: true });

      // 找到对应的比赛并存入store
      const contest = contests?.find(c => c.id === contestId);
      if (contest) {
        setContest(contest);
      }

      router.push(`/contest/${contestId}/problems`);
    } catch {
      // Handle error silently or show user-friendly message
    }
  };

  if (contestsLoading) {
    return <div className="flex items-center justify-center h-64">加载比赛中...</div>;
  }

  if (contestsError || !contests) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">加载比赛失败</h2>
          <p className="text-gray-600">请刷新页面或检查您的连接。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">比赛列表</h1>
        <p className="text-gray-600 text-lg">选择一个比赛并开始答题</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contests.map(contest => {
          const { status, color } = getContestStatus(contest);

          return (
            <Card
              key={contest.id}
              className="hover:shadow-xl transition-all duration-300 flex flex-col h-[320px] hover:border-blue-300"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1 flex items-center gap-2">
                      {contest.title}
                    </CardTitle>
                    <Badge className={`${color} mb-2`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-sm h-[40px] overflow-y-auto mb-2 pr-1 custom-scrollbar">
                  {contest.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-0 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">开始时间: {formatDate(contest.startTime)}</div>
                      <div className="text-gray-600">结束时间: {formatDate(contest.endTime)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>类型: {getContestTypeName(contest.type)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t mt-auto">
                  <Button
                    onClick={() => handleEnterContest(contest.id)}
                    className="w-full h-10 text-base font-medium"
                    size="default"
                    disabled={status !== 'running'}
                  >
                    {status === 'running' ? (
                      <UserPlus className="w-5 h-5 mr-2" />
                    ) : status === 'upcoming' ? (
                      <Clock className="w-5 h-5 mr-2" />
                    ) : (
                      <TimerOff className="w-5 h-5 mr-2" />
                    )}
                    {status === 'running'
                      ? '加入比赛'
                      : status === 'upcoming'
                        ? '未开始'
                        : '已结束'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {contests.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">暂无比赛</h3>
            <p className="text-gray-600">请稍后再来查看新的比赛</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useContestRanking } from '@/hooks';
import { CONTEST_TYPES } from '@/lib/contest-types';
import { useContestStore } from '@/lib/store';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define the ranking types based on the API response
interface RankingProblem {
  problemId: string;
  state: number;
  point: number;
  triedTimes: number;
  scoreAchievedTime: string;
}

interface RankingUser {
  problems: RankingProblem[];
  username: string;
  totalScore: number;
  rank: number;
  penalty: number;
}

export default function ContestRankingPage() {
  const params = useParams();
  const contestId = parseInt(params.contestId as string);
  const pagination = {
    current: 1,
    size: 10,
  };

  // 从store中获取比赛信息，而不是通过API请求
  const { getContest } = useContestStore();
  const contest = getContest(contestId);

  const { data: rankingData, error, isLoading } = useContestRanking(contestId, pagination);

  // Check if contest is ACM type
  const isAcmContest = contest?.type === CONTEST_TYPES.ACM;

  // Helper function to determine the status badge style based on state
  const getStateDisplay = (state: number) => {
    switch (state) {
      case 1:
        return {
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-300',
        };
      case 2:
        return {
          text: 'Accepted',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-300',
        };
      case 3:
        return {
          text: 'Failed',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-300',
        };
      default:
        return {
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-gray-300',
        };
    }
  };

  // Format time to readable string
  const formatTime = (timeString: string) => {
    if (!timeString) return '—';
    const date = new Date(timeString);
    return date.toLocaleString();
  };

  // Extract unique problem IDs for column headers
  const problemIds =
    rankingData?.users?.[0]?.problems.map((p: RankingProblem) => p.problemId) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">排名</h2>
          <p className="text-gray-600">比赛排名</p>
        </div>
      </div>
      <Card>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p>加载排名数据中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">加载排名失败</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                重试
              </Button>
            </div>
          ) : rankingData && rankingData.users && rankingData.users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">排名</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>分数</TableHead>
                  {problemIds.map((id: string) => (
                    <TableHead key={id}>题目 {id}</TableHead>
                  ))}
                  {isAcmContest && <TableHead>罚时</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.users.map((user: RankingUser) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.rank}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.totalScore}</TableCell>
                    {problemIds.map((id: string) => {
                      const problem = user.problems.find((p: RankingProblem) => p.problemId === id);
                      if (!problem)
                        return (
                          <TableCell key={id} className="text-gray-400">
                            —
                          </TableCell>
                        );

                      const state = getStateDisplay(problem.state);
                      return (
                        <TableCell key={id}>
                          <div className="flex flex-col">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${state.className} w-fit`}
                            >
                              {state.text}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">{problem.point} 分</span>
                            <span className="text-xs text-gray-500">
                              {isAcmContest && problem.triedTimes > 0
                                ? `${problem.triedTimes} 次`
                                : ''}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(problem.scoreAchievedTime)}
                            </span>
                          </div>
                        </TableCell>
                      );
                    })}
                    {isAcmContest && <TableCell>{user.penalty}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>比赛排名 截至 {new Date().toLocaleString()}</TableCaption>
            </Table>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">没有排名数据</h3>
              <p className="text-gray-600">比赛可能还没有任何参与者</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

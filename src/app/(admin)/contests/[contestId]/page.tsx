'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, Users, BarChart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ContestManagementPage() {
  const params = useParams();
  const contestId = params.contestId as string;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">比赛管理中心</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/contests/${contestId}/problems`} className="block">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center space-y-2"
          >
            <BookOpen className="h-6 w-6" />
            <span>题目管理</span>
          </Button>
        </Link>

        <Link href={`/contests/${contestId}/users`} className="block">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center space-y-2"
          >
            <Users className="h-6 w-6" />
            <span>参赛选手管理</span>
          </Button>
        </Link>

        <Link href={`/contests/${contestId}/results`} className="block">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center space-y-2"
          >
            <BarChart className="h-6 w-6" />
            <span>成绩与排名</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

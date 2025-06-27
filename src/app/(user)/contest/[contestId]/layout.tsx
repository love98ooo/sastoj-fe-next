'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContestLayoutProps {
  children: ReactNode;
}

export default function ContestLayout({ children }: ContestLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const contestId = params.contestId as string;

  // 根据当前路径确定活动的 tab
  const getActiveTab = () => {
    if (pathname.includes('/ranking')) return 'ranking';
    return 'problems';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={getActiveTab()} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="problems" asChild>
            <Link href={`/contest/${contestId}/problems`}>题目</Link>
          </TabsTrigger>
          <TabsTrigger value="ranking" asChild>
            <Link href={`/contest/${contestId}/ranking`}>排名</Link>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">{children}</div>
      </Tabs>
    </div>
  );
}

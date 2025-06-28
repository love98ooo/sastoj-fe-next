'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ContestLayoutProps = {
  children: ReactNode;
};

export default function ContestLayout({ children }: ContestLayoutProps) {
  const params = useParams();
  const contestId = params.contestId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/contests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回比赛列表
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">比赛题目管理 - ID: {contestId}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

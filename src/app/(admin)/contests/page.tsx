import { Metadata } from 'next';
import { Suspense } from 'react';
import { ContestsClient } from './contests-client';

export const metadata: Metadata = {
  title: '比赛管理 - SASTOJ',
  description: 'SASTOJ 比赛管理',
};

export default function ContestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">比赛管理</h1>
        <p className="text-muted-foreground mt-2">创建和管理比赛，设置比赛类型、时间和其他配置</p>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <ContestsClient />
      </Suspense>
    </div>
  );
}

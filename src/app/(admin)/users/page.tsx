import { Suspense } from 'react';
import { UsersClient } from './users-client';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
        <p className="text-muted-foreground mt-2">管理系统用户，包括创建、编辑和权限设置</p>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <UsersClient />
      </Suspense>
    </div>
  );
}

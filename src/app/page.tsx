'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { tokenManager } from '@/lib/auth';
import { Logo } from '@/components/shared';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and redirect accordingly
    if (tokenManager.isAuthenticated()) {
      router.push('/contest');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Logo width={48} height={48} alt="SASTOJ Logo" />
          </div>
          <CardTitle className="text-2xl font-bold">SASTOJ</CardTitle>
          <CardDescription>在线评测系统</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="text-gray-600">重定向中...</div>
            <div className="flex space-x-4">
              <Button onClick={() => router.push('/login')} variant="outline" className="flex-1">
                登录
              </Button>
              <Button onClick={() => router.push('/contest')} className="flex-1">
                比赛
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

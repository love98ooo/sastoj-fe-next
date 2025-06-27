import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverTokenManager } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared';

export default async function HomePage() {
  // Server-side authentication check
  const cookieStore = await cookies();
  const cookiesFunction = () => cookieStore;

  if (serverTokenManager.isAuthenticated(cookiesFunction)) {
    // Get the appropriate route based on user role
    const userRoute = serverTokenManager.getUserRoute(cookiesFunction);
    redirect(userRoute);
  } else {
    // Not authenticated, redirect to login
    redirect('/login');
  }

  // This return statement will never be reached due to redirects above,
  // but we need it for TypeScript compliance
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
              <Button variant="outline" className="flex-1">
                登录
              </Button>
              <Button className="flex-1">比赛</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks';
import { useToast } from '@/hooks';
import { ThemeToggle } from '@/components/shared';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const { trigger: login, isMutating: isLogging } = useLogin();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      const result = await login({ username: username.trim(), password });

      if (result.token) {
        // Store token in localStorage
        localStorage.setItem('token', result.token);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('username', username.trim());
        }

        // Show success message
        setError('');

        // Redirect to problems page
        router.push('/contest');
      } else {
        setError('登录失败：未收到令牌');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '登录失败，请检查您的凭据');
    }
  };

  // Load remembered username on component mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const rememberedUsername = localStorage.getItem('username');
      const shouldRemember = localStorage.getItem('rememberMe') === 'true';
      if (shouldRemember && rememberedUsername) {
        setUsername(rememberedUsername);
        setRememberMe(true);
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Image src="/sastoj.svg" alt="SASTOJ 标志" width={48} height={48} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">SASTOJ</h1>
          <p className="mt-2 text-sm text-muted-foreground">在线评测系统</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  用户名
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="请输入用户名"
                  required
                  disabled={isLogging}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="请输入密码"
                    required
                    disabled={isLogging}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLogging}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    disabled={isLogging}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">记住我</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  忘记密码？
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLogging || !username.trim() || !password.trim()}
                className="w-full"
              >
                {isLogging ? '登录中...' : '登录'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">或继续使用</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  disabled={isLogging}
                  onClick={() => {
                    // TODO: Implement Lark login
                    toast({
                      variant: 'warning',
                      title: '功能暂未开放',
                      description: 'Lark 登录功能暂未实现',
                    });
                  }}
                >
                  飞书登录
                </Button>
                <Button
                  variant="outline"
                  disabled={isLogging}
                  onClick={() => {
                    // TODO: Implement link login
                    toast({
                      variant: 'warning',
                      title: '功能暂未开放',
                      description: 'Link 登录功能暂未实现',
                    });
                  }}
                >
                  Link 登录
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

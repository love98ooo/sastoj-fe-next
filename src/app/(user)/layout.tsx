'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy } from 'lucide-react';
import { useAuthGuard } from '@/lib/auth';
import { ThemeToggle } from '@/components/shared';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, logout } = useAuthGuard();

  // Set mounted to true on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated (only after mount)
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (only after mount)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please login to access this page.</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: '比赛',
      href: '/contest',
      icon: Trophy,
      description: '浏览和加入比赛',
    },
    // {
    //   name: 'Problems',
    //   href: '/problems',
    //   icon: FileText,
    //   description: 'Browse and solve problems'
    // },
    // {
    //   name: 'Submissions',
    //   href: '/submissions',
    //   icon: History,
    //   description: 'View your submission history'
    // },
    // {
    //   name: 'Profile',
    //   href: '/profile',
    //   icon: UserCircle,
    //   description: 'Manage your account'
    // },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center">
              <Link href="/contest" className="flex items-center space-x-2">
                <Image src="/sastoj.svg" alt="SASTOJ Logo" width={28} height={28} className="mr-2" />
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  SASTOJ
                </div>
              </Link>

              <div className="ml-10 flex space-x-8">
                {navigation.map(item => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{user?.username || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{user?.role || 'user'}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

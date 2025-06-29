'use client';

import Link from 'next/link';
import {
  Users,
  LogOut,
  User,
  UserPlus,
  Trophy,
  LayoutDashboard,
  PanelLeftClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Logo } from '@/components/shared/logo';
import { usePathname, useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/auth';

// 定义菜单项类型
interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 导航菜单项
const navigationItems: MenuItem[] = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '比赛管理',
    href: '/contests',
    icon: Trophy,
  },
  {
    title: '用户管理',
    href: '/users',
    icon: Users,
  },
  {
    title: '用户组管理',
    href: '/groups',
    icon: UserPlus,
  },
  // {
  //   title: '提交记录',
  //   href: '/submissions',
  //   icon: ClipboardList,
  // },
  // {
  //   title: '系统设置',
  //   href: '/settings',
  //   icon: Settings,
  // },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [contestName, setContestName] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, logout } = useAuthGuard();

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

  // 获取比赛名称
  useEffect(() => {
    const paths = pathname.split('/').filter(Boolean);
    if (paths.length > 1 && paths[0] === 'contests') {
      const contestId = paths[1];
      contestApi
        .getById(contestId)
        .then(contest => {
          setContestName(contest.title || `比赛 #${contestId}`);
        })
        .catch(() => {
          // 如果获取失败，使用默认值
          setContestName(`比赛 #${contestId}`);
        });
    }
  }, [pathname]);

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

  // 生成面包屑导航
  const renderBreadcrumb = () => {
    const paths = pathname.split('/').filter(Boolean);

    // 如果是根路径，直接显示仪表盘
    if (paths.length === 0) {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>仪表盘</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }

    // 构建面包屑导航项
    const breadcrumbItems: { title: string; href: string; isActive: boolean }[] = [];

    // 第一个项目始终是管理后台，链接到仪表盘
    breadcrumbItems.push({
      title: '管理后台',
      href: '/dashboard',
      isActive: false,
    });

    // 处理比赛相关路径
    if (paths[0] === 'contests') {
      // 添加比赛管理层级
      breadcrumbItems.push({
        title: '比赛管理',
        href: '/contests',
        isActive: paths.length === 1,
      });

      // 如果是比赛详情页
      if (paths.length > 1) {
        const contestId = paths[1];
        breadcrumbItems.push({
          title: contestName || `比赛 #${contestId}`,
          href: `/contests/${contestId}`,
          isActive: paths.length === 2,
        });

        // 如果是比赛问题页面
        if (paths.length > 2 && paths[2] === 'problems') {
          breadcrumbItems.push({
            title: '题目管理',
            href: `/contests/${contestId}/problems`,
            isActive: true,
          });
        }
      }
    }
    // 处理其他页面
    else {
      // 查找当前路径对应的菜单项
      const menuItem = navigationItems.find(item => item.href.includes(`/${paths[0]}`));

      if (menuItem) {
        breadcrumbItems.push({
          title: menuItem.title,
          href: menuItem.href,
          isActive: true,
        });
      }
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={index}>
              {!item.isActive ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </BreadcrumbLink>
                  {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider className="min-h-screen w-full">
      <Sidebar className="h-screen" variant="inset">
        <SidebarContent>
          {/* Logo 区域 */}
          <div className="flex h-16 items-center px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">SASTOJ</span>
                <span className="text-xs text-muted-foreground">管理后台</span>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <SidebarGroup>
            <SidebarMenu className="px-3">
              {navigationItems.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href} className="my-1">
                    <Link href={item.href} className="w-full block">
                      <SidebarMenuButton isActive={isActive} className="w-full px-3">
                        <item.icon className="h-[18px] w-[18px] mr-2" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* 用户信息 - 放在底部 */}
          <div className="mt-auto p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">管理员</p>
                  <p className="text-xs text-muted-foreground">admin@sastoj.com</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* 主内容区域 */}
      <SidebarInset className="bg-background">
        {/* 顶部导航栏 */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <SidebarTrigger>
            <PanelLeftClose className="h-5 w-5" />
          </SidebarTrigger>

          <div className="flex items-center gap-2">{renderBreadcrumb()}</div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

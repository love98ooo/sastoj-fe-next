import { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3,
  FileText,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  User,
  UserPlus,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared';

export const metadata: Metadata = {
  title: 'SASTOJ - 管理后台',
  description: 'SASTOJ 在线判题系统管理后台',
};

// 导航菜单项
const navigationItems = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: '比赛管理',
    href: '/contests',
    icon: Trophy,
  },
  {
    title: '题目管理',
    href: '/problems',
    icon: FileText,
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
  {
    title: '提交记录',
    href: '/submissions',
    icon: ClipboardList,
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* 侧边栏 */}
        <aside className="w-64 bg-card border-r border-border">
          {/* Logo 区域 */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">SASTOJ</span>
                <span className="text-xs text-muted-foreground">管理后台</span>
              </div>
            </Link>
          </div>

          {/* 导航菜单 */}
          <nav className="p-4">
            <ul className="space-y-1">
              {navigationItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航栏 */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">管理后台</h1>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {/* 用户信息 */}
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">管理员</div>
                  <div className="text-xs text-muted-foreground">admin@sastoj.com</div>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </header>

          {/* 页面内容 */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  // 模拟数据
  const stats = [
    {
      title: '题目总数',
      value: '156',
      change: '+12',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'blue',
    },
    {
      title: '用户总数',
      value: '1,234',
      change: '+89',
      changeType: 'positive' as const,
      icon: Users,
      color: 'green',
    },
    {
      title: '提交总数',
      value: '12,345',
      change: '+567',
      changeType: 'positive' as const,
      icon: ClipboardList,
      color: 'yellow',
    },
    {
      title: '通过率',
      value: '67.8%',
      change: '+2.3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'problem',
      title: '新增题目',
      description: '"两数之和"',
      time: '2 小时前',
      icon: FileText,
      color: 'blue',
    },
    {
      id: 2,
      type: 'user',
      title: '用户注册',
      description: '张三 注册成功',
      time: '4 小时前',
      icon: Users,
      color: 'green',
    },
    {
      id: 3,
      type: 'submission',
      title: '新提交',
      description: '收到 50 个新提交',
      time: '6 小时前',
      icon: ClipboardList,
      color: 'yellow',
    },
    {
      id: 4,
      type: 'system',
      title: '系统维护',
      description: '定期维护完成',
      time: '8 小时前',
      icon: CheckCircle,
      color: 'purple',
    },
  ];

  const submissionStats = [
    { status: '通过', count: 8432, percentage: 68, color: 'bg-green-500' },
    { status: '错误', count: 2341, percentage: 19, color: 'bg-red-500' },
    { status: '超时', count: 987, percentage: 8, color: 'bg-yellow-500' },
    { status: '其他', count: 585, percentage: 5, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">管理仪表盘</h1>
        <p className="text-muted-foreground mt-2">欢迎回到 SASTOJ 管理后台，这里是系统概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="ml-1">较上月</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* 主要内容区域 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 系统概览 */}
          <Card>
            <CardHeader>
              <CardTitle>系统概览</CardTitle>
              <CardDescription>查看系统整体运行状况和关键指标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>服务器负载</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>内存使用</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>磁盘空间</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>网络带宽</span>
                    <span>15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交统计 */}
          <Card>
            <CardHeader>
              <CardTitle>提交统计</CardTitle>
              <CardDescription>查看提交结果分布和趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissionStats.map(item => (
                  <div key={item.status} className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.status}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 性能监控 */}
          <Card>
            <CardHeader>
              <CardTitle>性能监控</CardTitle>
              <CardDescription>系统性能指标和健康状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">数据库连接正常</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Redis 缓存正常</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">判题队列繁忙</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">最近 24 小时</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>平均响应时间</span>
                    <span>142ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>错误率</span>
                    <span>0.02%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>在线用户</span>
                    <span>234</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 - 最近活动 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>最近活动</span>
              </CardTitle>
              <CardDescription>系统最新动态和操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          activity.color === 'blue'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : activity.color === 'green'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                              : activity.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}
                      >
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    {index < recentActivities.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用管理功能快捷入口</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <a
                href="/problems/new"
                className="flex items-center space-x-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">添加新题目</span>
              </a>
              <a
                href="/users"
                className="flex items-center space-x-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">用户管理</span>
              </a>
              <a
                href="/submissions"
                className="flex items-center space-x-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="text-sm">查看提交</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

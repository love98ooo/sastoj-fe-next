'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Server,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface QueueStats {
  queueName: string;
  messagesReady: string;
  messagesUnacked: string;
  consumers: string;
  memory: string;
  messageRateIn: string;
  messageRateOut: string;
  messageRateAck: string;
}

export default function DashboardPage() {
  const [queueStats, setQueueStats] = useState<QueueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQueueStats = async () => {
    try {
      setLoading(true);
      setError(null);

      interface QueueStatsResponse {
        stats: QueueStats[];
      }

      const response = await api.get<QueueStatsResponse>('/mq/queue-stats');
      setQueueStats(response.stats || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch queue stats:', err);
      setError('获取队列状态失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载
    fetchQueueStats();

    // 设置定时轮询 (每3秒刷新一次)
    const intervalId = setInterval(fetchQueueStats, 3000);

    // 清理函数
    return () => clearInterval(intervalId);
  }, []);

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

  // 判断队列状态
  const getQueueStatus = (stats: QueueStats[]) => {
    if (!stats || stats.length === 0) return 'unknown';

    // 检查是否有队列消息堆积
    const hasBacklog = stats.some(q => parseInt(q.messagesReady) > 100);
    // 检查是否有队列没有消费者
    const hasNoConsumers = stats.some(q => q.consumers === '0');

    if (hasBacklog) return 'busy';
    if (hasNoConsumers) return 'warning';
    return 'normal';
  };

  const queueStatus = getQueueStatus(queueStats);

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
          {/* 判题队列监控 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>判题队列监控</CardTitle>
                <CardDescription>实时监控判题队列状态和负载</CardDescription>
              </div>
              <button
                onClick={() => fetchQueueStats()}
                className="p-1 rounded-full hover:bg-accent"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>错误</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {queueStatus === 'normal' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {queueStatus === 'busy' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  {queueStatus === 'warning' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                  {queueStatus === 'unknown' && <Server className="h-4 w-4 text-gray-500" />}

                  <span className="text-sm font-medium">
                    {queueStatus === 'normal' && '判题队列正常'}
                    {queueStatus === 'busy' && '判题队列繁忙'}
                    {queueStatus === 'warning' && '判题队列警告'}
                    {queueStatus === 'unknown' && '判题队列状态未知'}
                  </span>
                </div>

                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    更新于: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                {loading && !queueStats.length ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    ))
                ) : queueStats.length === 0 && !loading ? (
                  <div className="text-center py-4 text-muted-foreground">没有找到队列数据</div>
                ) : (
                  queueStats.map((queue, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4" />
                          <span className="font-medium">{queue.queueName}</span>
                        </div>
                        <Badge
                          variant={parseInt(queue.messagesReady) > 100 ? 'destructive' : 'outline'}
                        >
                          {queue.consumers} 消费者
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">待处理消息</span>
                            <span>{queue.messagesReady}</span>
                          </div>
                          <Progress
                            value={Math.min(parseInt(queue.messagesReady) / 10, 100)}
                            className="h-1"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">未确认消息</span>
                            <span>{queue.messagesUnacked}</span>
                          </div>
                          <Progress
                            value={Math.min(parseInt(queue.messagesUnacked) / 10, 100)}
                            className="h-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>入队速率: {parseFloat(queue.messageRateIn).toFixed(2)}/秒</div>
                        <div>出队速率: {parseFloat(queue.messageRateOut).toFixed(2)}/秒</div>
                        <div>确认速率: {parseFloat(queue.messageRateAck).toFixed(2)}/秒</div>
                      </div>

                      {index < queueStats.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 - 最近活动 */}
        <div className="lg:col-span-3">
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

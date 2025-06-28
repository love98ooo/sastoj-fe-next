'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash, Search, BookOpen } from 'lucide-react';
import { contestApi } from '@/lib/api';
import { Contest } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { ContestFormDialog } from '@/components/admin/contest-form-dialog';
import { getContestTypeName } from '@/lib/contest-types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

function formatDateTime(dateTimeString: string) {
  const date = new Date(dateTimeString);
  return formatDate(date);
}

function ContestTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function ContestsClient() {
  const { toast } = useToast();
  const [allContests, setAllContests] = useState<Contest[]>([]); // 所有比赛数据
  const [loading, setLoading] = useState(true);

  // 搜索和筛选状态
  const [filters, setFilters] = useState({
    title: '',
    status: undefined as string | undefined,
  });

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<Contest | undefined>(undefined);

  // 修正onOpenChange的类型
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingContest(undefined);
    }
  };

  // 使用 useCallback 优化 fetchContests 函数
  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contestApi.getList({
        current: 1,
        size: 1000, // 获取大量记录，最多1000条
      });

      setAllContests(response.contests || []);
    } catch {
      toast({
        title: '错误',
        description: '无法加载比赛数据',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 前端筛选逻辑
  const filteredContests = useMemo(() => {
    return allContests.filter(contest => {
      const matchTitle =
        !filters.title || contest.title.toLowerCase().includes(filters.title.toLowerCase());

      const matchStatus = !filters.status || contest.status?.toString() === filters.status;

      return matchTitle && matchStatus;
    });
  }, [allContests, filters.title, filters.status]);

  // 初始加载数据
  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  // 获取比赛状态
  const getContestStatus = (status?: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">未开始</Badge>;
      case 1:
        return <Badge variant="success">进行中</Badge>;
      case 2:
        return <Badge variant="outline">已结束</Badge>;
      default:
        return <Badge variant="default">未知</Badge>;
    }
  };

  // 获取状态文本（用于筛选显示）
  const getStatusText = (status?: string) => {
    switch (status) {
      case '0':
        return '未开始';
      case '1':
        return '进行中';
      case '2':
        return '已结束';
      default:
        return '全部状态';
    }
  };

  // 搜索处理
  const handleSearch = () => {
    // 搜索时只需要让 filteredContests 重新计算
  };

  // 重置搜索
  const handleReset = () => {
    setFilters({
      title: '',
      status: undefined,
    });
  };

  // 编辑比赛
  const handleEdit = (contest: Contest) => {
    setEditingContest(contest);
    setDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchContests(); // 编辑成功后刷新数据
    setEditingContest(undefined); // 清除编辑状态
  };

  // 删除比赛
  const handleDelete = async () => {
    if (!contestToDelete) return;

    try {
      await contestApi.delete(contestToDelete.id);
      toast({
        title: '成功',
        description: '比赛已删除',
      });

      // 在前端更新数据，删除已删除的比赛
      setAllContests(prev => prev.filter(c => c.id !== contestToDelete.id));
    } catch {
      toast({
        title: '错误',
        description: '删除失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setContestToDelete(undefined);
    }
  };

  const openDeleteDialog = (contest: Contest) => {
    setContestToDelete(contest);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>搜索和筛选</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="title">比赛标题</Label>
              <Input
                id="title"
                placeholder="搜索比赛标题"
                value={filters.title}
                onChange={e => setFilters(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={filters.status?.toString() || 'all'}
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    status: value === 'all' ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={getStatusText(filters.status)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="0">未开始</SelectItem>
                  <SelectItem value="1">进行中</SelectItem>
                  <SelectItem value="2">已结束</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">比赛列表</h2>
          <Badge variant="secondary">{filteredContests.length} 个比赛</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加比赛
          </Button>
        </div>
      </div>

      {/* 比赛列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <ContestTableSkeleton />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>开始时间</TableHead>
                  <TableHead>结束时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-[150px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无比赛数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContests.map(contest => (
                    <TableRow key={contest.id}>
                      <TableCell className="font-mono text-sm">{contest.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{contest.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getContestTypeName(contest.type)}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(contest.startTime)}</TableCell>
                      <TableCell>{formatDateTime(contest.endTime)}</TableCell>
                      <TableCell>{getContestStatus(contest.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/contests/${contest.id}`}>
                              <BookOpen className="h-4 w-4 mr-1" /> 详情
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(contest)}>
                            <Pencil className="h-4 w-4 mr-1" /> 编辑
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(contest)}
                          >
                            <Trash className="h-4 w-4 mr-1" /> 删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <ContestFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        onSuccess={handleEditSuccess}
        contest={editingContest}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除比赛 &quot;{contestToDelete?.title}&quot;
              吗？此操作不可逆，且会删除与该比赛相关的所有数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

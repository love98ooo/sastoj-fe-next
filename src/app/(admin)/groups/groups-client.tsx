'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash } from 'lucide-react';
import { groupApi } from '@/lib/api';
import { Group } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { GroupFormDialog } from '@/components/admin/group-form-dialog';

function GroupTableSkeleton() {
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

interface GroupsTableProps {
  onRefresh: () => void;
}

function GroupsTable({ onRefresh }: GroupsTableProps) {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | undefined>(undefined);

  // 使用 useCallback 优化 fetchGroups 函数
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await groupApi.getList();
      setGroups(response.groups);
    } catch {
      toast({
        title: '错误',
        description: '无法加载用户组数据',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch groups on initial load
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // 解析用户组名称以获取前缀和类型
  const parseGroupName = (name: string) => {
    if (name.startsWith('admin')) {
      return {
        prefix: 'admin',
        name: name.substring(6),
        type: '管理员组',
        variant: 'admin' as const,
      };
    } else if (name.startsWith('public_')) {
      return {
        prefix: 'public_',
        name: name.substring(7),
        type: '公共用户组',
        variant: 'info' as const,
      };
    } else if (name.startsWith('user_')) {
      return {
        prefix: 'user_',
        name: name.substring(5),
        type: '普通用户组',
        variant: 'success' as const,
      };
    }
    return {
      prefix: '',
      name,
      type: '未分类',
      variant: 'secondary' as const,
    };
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchGroups(); // 编辑成功后刷新数据
    onRefresh(); // 通知父组件
    setEditingGroup(undefined); // 清除编辑状态
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;

    try {
      await groupApi.delete(groupToDelete.id);
      toast({
        title: '成功',
        description: '用户组已删除',
      });
      fetchGroups(); // 删除成功后刷新数据
      onRefresh(); // 通知父组件
    } catch (error) {
      toast({
        title: '错误',
        description: `删除失败，请重试: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(undefined);
    }
  };

  const openDeleteDialog = (group: Group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <GroupTableSkeleton />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead className="w-[150px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                暂无用户组数据
              </TableCell>
            </TableRow>
          ) : (
            groups.map(group => {
              const parsed = parseGroupName(group.name);
              return (
                <TableRow key={group.id}>
                  <TableCell className="font-mono text-sm">{group.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{group.name}</span>
                      {parsed.prefix && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {parsed.prefix}
                          <span className="font-medium">{parsed.name}</span>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={parsed.variant}>{parsed.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(group)}>
                        <Pencil className="h-4 w-4 mr-1" /> 编辑
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(group)}
                      >
                        <Trash className="h-4 w-4 mr-1" /> 删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* 编辑对话框 */}
      <GroupFormDialog
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open);
          if (!open) {
            setEditingGroup(undefined); // 关闭时清除编辑状态
          }
        }}
        onSuccess={handleEditSuccess}
        group={editingGroup}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除用户组 &quot;{groupToDelete?.name}&quot; 吗？此操作不可逆。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function GroupsPageClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 刷新函数，用于触发重新渲染
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleCreateSuccess = () => {
    handleRefresh(); // 创建成功后刷新数据
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">用户组管理</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> 新建用户组
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户组列表</CardTitle>
          <CardDescription>管理系统中的所有用户组</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupsTable key={refreshTrigger} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      {/* 创建用户组对话框 */}
      <GroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleCreateSuccess}
        group={undefined}
      />
    </div>
  );
}

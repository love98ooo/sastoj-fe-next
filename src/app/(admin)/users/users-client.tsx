'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userApi, groupApi } from '@/lib/api';
import { User, Group, UsersResponse } from '@/lib/schemas';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { BatchUserDialog } from '@/components/admin/batch-user-dialog';

export function UsersClient() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
  });

  // 搜索和筛选状态
  const [filters, setFilters] = useState({
    username: '',
    state: undefined as number | undefined,
    group_ids: [] as string[],
  });

  // 对话框状态
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [batchUserOpen, setBatchUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response: UsersResponse = await userApi.getUsers({
        current: pagination.current,
        size: pagination.size,
        ...filters,
      });

      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch {
      toast({
        title: '错误',
        description: '加载用户列表失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载用户组列表
  const loadGroups = async () => {
    try {
      const response = await groupApi.getList();
      setGroups(response.groups);
    } catch {
      toast({
        title: '错误',
        description: '加载用户组列表失败',
        variant: 'destructive',
      });
    }
  };

  // 初始化数据
  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.size]);

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadUsers();
  };

  // 重置搜索
  const handleReset = () => {
    setFilters({
      username: '',
      state: undefined,
      group_ids: [],
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(loadUsers, 0);
  };

  // 编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  // 表单成功回调
  const handleFormSuccess = () => {
    loadUsers();
    setEditingUser(undefined);
  };

  // 获取状态显示
  const getStateDisplay = (state: number) => {
    switch (state) {
      case 0:
        return <Badge variant="default">正常</Badge>;
      case 1:
        return <Badge variant="destructive">禁用</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="搜索用户名"
                value={filters.username}
                onChange={e => setFilters(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">状态</Label>
              <Select
                value={filters.state?.toString() || 'all'}
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    state: value === 'all' ? undefined : parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="0">正常</SelectItem>
                  <SelectItem value="1">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groups">用户组</Label>
              <Select
                value={filters.group_ids[0] || 'all'}
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    group_ids: value === 'all' ? [] : [value],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择用户组" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部用户组</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
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
          <h2 className="text-lg font-semibold">用户列表</h2>
          <Badge variant="secondary">{pagination.total} 个用户</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setBatchUserOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            批量创建
          </Button>
          <Button onClick={() => setUserFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>用户组</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(user.groupIds || []).map((group, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStateDisplay(user.state)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt || '').toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.total > pagination.size && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            显示 {Math.min((pagination.current - 1) * pagination.size + 1, pagination.total)} -{' '}
            {Math.min(pagination.current * pagination.size, pagination.total)} 条，共{' '}
            {pagination.total} 条
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current <= 1}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current * pagination.size >= pagination.total}
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 对话框 */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        onSuccess={handleFormSuccess}
        user={editingUser}
        groups={groups}
      />

      <BatchUserDialog
        open={batchUserOpen}
        onOpenChange={setBatchUserOpen}
        onSuccess={handleFormSuccess}
        groups={groups}
      />
    </div>
  );
}

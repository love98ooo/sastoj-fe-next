'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userApi } from '@/lib/api';
import { User, Group, UserUpdateRequest, UserCreateRequest } from '@/lib/schemas';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user?: User;
  groups: Group[];
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSuccess,
  user,
  groups,
}: UserFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    groupIds: [] as number[],
    state: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;
  const title = isEditing ? '编辑用户' : '新建用户';
  const description = isEditing ? '更新用户信息和权限' : '创建一个新用户';

  // 当对话框打开时，设置初始值
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          username: user.username,
          password: '', // 编辑时不显示密码
          groupIds: user.groupIds,
          state: user.state,
        });
      } else {
        setFormData({
          username: '',
          password: '',
          groupIds: [],
          state: 0,
        });
      }
      setIsSubmitting(false);
    }
  }, [open, user]);

  // 重置表单状态
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      groupIds: [],
      state: 0,
    });
    setIsSubmitting(false);
  };

  // 处理用户组选择
  const handleGroupToggle = (groupId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      groupIds: checked ? [...prev.groupIds, groupId] : prev.groupIds.filter(id => id !== groupId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast({
        title: '错误',
        description: '请输入用户名',
        variant: 'destructive',
      });
      return;
    }

    if (!isEditing && !formData.password.trim()) {
      toast({
        title: '错误',
        description: '请输入密码',
        variant: 'destructive',
      });
      return;
    }

    if (formData.groupIds.length === 0) {
      toast({
        title: '错误',
        description: '请至少选择一个用户组',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && user) {
        const updateData: UserUpdateRequest = {
          id: user.id,
          username: formData.username.trim(),
          groupIds: formData.groupIds.map(id => id.toString()),
          state: formData.state,
        };
        await userApi.updateUser(updateData);
        toast({
          title: '成功',
          description: '用户更新成功',
        });
      } else {
        const createData: UserCreateRequest = {
          username: formData.username.trim(),
          password: formData.password,
          groupIds: formData.groupIds,
        };
        await userApi.createUser(createData);
        toast({
          title: '成功',
          description: '用户创建成功',
        });
      }

      // 成功后的操作
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch {
      toast({
        title: '错误',
        description: isEditing ? '更新失败，请重试' : '创建失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // 延迟重置表单，避免用户看到表单状态变化
      setTimeout(resetForm, 150);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 用户名 */}
            <div className="grid gap-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="输入用户名"
                autoComplete="off"
                disabled={isSubmitting}
                maxLength={50}
              />
            </div>

            {/* 密码 */}
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="password">密码 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="输入密码"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
            )}

            {/* 状态 */}
            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="state">状态</Label>
                <Select
                  value={formData.state.toString()}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, state: parseInt(value) }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">正常</SelectItem>
                    <SelectItem value="1">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 用户组 */}
            <div className="grid gap-2">
              <Label>用户组 *</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {groups.length === 0 ? (
                  <div className="text-sm text-muted-foreground">暂无用户组</div>
                ) : (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={formData.groupIds.includes(parseInt(group.id))}
                          onCheckedChange={(checked: boolean) =>
                            handleGroupToggle(parseInt(group.id), checked)
                          }
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {group.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                已选择 {formData.groupIds.length} 个用户组
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.username.trim() ||
                (!isEditing && !formData.password.trim()) ||
                formData.groupIds.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? '正在更新...' : '正在创建...'}
                </>
              ) : isEditing ? (
                '更新'
              ) : (
                '创建'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userApi } from '@/lib/api';
import { Group, BatchUserCreateRequest, BatchUserCreateResponse } from '@/lib/schemas';
import { Textarea } from '../ui/textarea';

interface BatchUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  groups: Group[];
}

export function BatchUserDialog({ open, onOpenChange, onSuccess, groups }: BatchUserDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    number: 10,
    groupIds: [] as number[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BatchUserCreateResponse | null>(null);

  // 当对话框打开时，重置状态
  useEffect(() => {
    if (open) {
      setFormData({
        number: 10,
        groupIds: [],
      });
      setResult(null);
      setIsSubmitting(false);
    }
  }, [open]);

  // 处理用户组选择
  const handleGroupToggle = (groupId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      groupIds: checked ? [...prev.groupIds, groupId] : prev.groupIds.filter(id => id !== groupId),
    }));
  };

  // 重置表单状态
  const resetForm = () => {
    setFormData({
      number: 10,
      groupIds: [],
    });
    setResult(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.number < 1 || formData.number > 100) {
      toast({
        title: '错误',
        description: '用户数量必须在1-100之间',
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

      const createData: BatchUserCreateRequest = {
        groupIds: formData.groupIds,
        number: formData.number,
      };

      const response = await userApi.batchCreateUsers(createData);
      setResult(response);

      toast({
        title: '成功',
        description: `成功创建 ${response.users.length} 个用户`,
      });

      // 通知父组件刷新数据
      onSuccess();
    } catch {
      toast({
        title: '错误',
        description: '批量创建用户失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下载用户信息
  const handleDownload = () => {
    if (!result) return;

    const csvContent = [
      'username,password',
      ...result.users.map(user => `${user.username},${user.password}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `batch_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <DialogContent className="w-full max-w-lg">
        {!result ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>批量创建用户</DialogTitle>
              <DialogDescription>
                批量生成用户账号和密码，系统会自动生成随机的用户名和密码
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* 用户数量 */}
              <div className="grid gap-2">
                <Label htmlFor="number">用户数量 *</Label>
                <Input
                  id="number"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.number}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))
                  }
                  placeholder="输入要创建的用户数量"
                  disabled={isSubmitting}
                />
                <div className="text-xs text-muted-foreground">最多可创建100个用户</div>
              </div>

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
                            id={`batch-group-${group.id}`}
                            checked={formData.groupIds.includes(parseInt(group.id))}
                            onCheckedChange={(checked: boolean) =>
                              handleGroupToggle(parseInt(group.id), checked)
                            }
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor={`batch-group-${group.id}`}
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
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  取消
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting || formData.number < 1 || formData.groupIds.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在创建...
                  </>
                ) : (
                  '创建用户'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>创建成功</DialogTitle>
              <DialogDescription>
                成功创建 {result.users.length} 个用户，请保存用户账号和密码信息
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-4">
                <Label>用户账号信息</Label>
                <Textarea
                  value={result.users.map(user => `${user.username}: ${user.password}`).join('\n')}
                  readOnly
                  className="w-full h-40 p-3 border rounded-md font-mono text-xs resize-none"
                />
              </div>

              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <strong>重要提示：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 请务必保存这些账号信息，关闭对话框后将无法再次查看</li>
                  <li>• 建议下载CSV文件进行备份</li>
                  <li>• 用户可以使用这些账号登录系统</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                下载CSV
              </Button>
              <Button onClick={handleClose}>完成</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

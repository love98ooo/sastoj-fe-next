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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { groupApi } from '@/lib/api';
import { Group } from '@/lib/schemas';

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  group?: Group;
}

const GROUP_PREFIXES = [
  { value: 'user_', label: 'user_', description: '普通用户组' },
  { value: 'public_', label: 'public_', description: '公共用户组' },
  { value: 'admin_', label: 'admin_', description: '管理员组' },
];

export function GroupFormDialog({ open, onOpenChange, onSuccess, group }: GroupFormDialogProps) {
  const { toast } = useToast();
  const [prefix, setPrefix] = useState('user_');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!group;
  const title = isEditing ? '编辑用户组' : '新建用户组';
  const description = isEditing ? '更新用户组信息' : '创建一个新的用户组';

  // 解析现有用户组的前缀和名称
  const parseGroupName = (fullName: string) => {
    const foundPrefix = GROUP_PREFIXES.find(p => fullName.startsWith(p.value));
    if (foundPrefix) {
      return {
        prefix: foundPrefix.value,
        name: fullName.substring(foundPrefix.value.length),
      };
    }
    return { prefix: 'user_', name: fullName };
  };

  // 当对话框打开时，设置初始值
  useEffect(() => {
    if (open) {
      if (group) {
        const parsed = parseGroupName(group.name);
        setPrefix(parsed.prefix);
        setName(parsed.name);
      } else {
        setPrefix('user_');
        setName('');
      }
      setIsSubmitting(false);
    }
  }, [open, group]);

  // 重置表单状态
  const resetForm = () => {
    setPrefix('user_');
    setName('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: '错误',
        description: '请输入用户组名称',
        variant: 'destructive',
      });
      return;
    }

    const fullName = prefix + name.trim();

    try {
      setIsSubmitting(true);

      if (isEditing && group) {
        await groupApi.update({ id: parseInt(group.id), name: fullName });
        toast({
          title: '成功',
          description: '用户组更新成功',
        });
      } else {
        await groupApi.create({ name: fullName });
        toast({
          title: '成功',
          description: '用户组创建成功',
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
            {/* 用户组名称 - 前缀和输入框组合 */}
            <div className="grid gap-2">
              <Label htmlFor="name">用户组名称</Label>
              <div className="flex">
                {/* 前缀选择器 */}
                <Select value={prefix} onValueChange={setPrefix} disabled={isSubmitting}>
                  <SelectTrigger className="w-24 rounded-r-none border-r-0 focus:z-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_PREFIXES.map(prefixOption => (
                      <SelectItem key={prefixOption.value} value={prefixOption.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{prefixOption.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 输入框 */}
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 rounded-l-none border-l-0 focus:z-10"
                  placeholder="输入用户组名称"
                  autoComplete="off"
                  disabled={isSubmitting}
                  maxLength={50}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                完整名称：
                <span className="font-mono bg-muted px-1 py-0.5 rounded">
                  {prefix}
                  {name || '...'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
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

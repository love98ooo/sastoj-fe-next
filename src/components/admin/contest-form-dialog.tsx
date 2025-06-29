'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { contestApi } from '@/lib/api';
import { Contest } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { CONTEST_TYPES } from '@/lib/contest-types';
interface ContestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  contest?: Contest; // 如果是编辑模式，则传入比赛对象
}

export function ContestFormDialog({
  open,
  onOpenChange,
  onSuccess,
  contest,
}: ContestFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Contest>>({
    title: '',
    description: '',
    type: CONTEST_TYPES.ACM, // 默认类型
    startTime: '',
    endTime: '',
    language: 'cpp,java,python',
    extraTime: 0,
  });

  // 内部日期对象状态
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // 当编辑对象改变时，初始化表单
  useEffect(() => {
    if (contest) {
      setFormData({
        ...contest,
        // 确保日期时间格式正确
        startTime: contest.startTime,
        endTime: contest.endTime,
      });

      // 设置日期选择器的值
      if (contest.startTime) {
        setStartDate(new Date(contest.startTime));
      }

      if (contest.endTime) {
        setEndDate(new Date(contest.endTime));
      }
    } else {
      // 重置表单
      setFormData({
        title: '',
        description: '',
        type: CONTEST_TYPES.ACM,
        startTime: '',
        endTime: '',
        language: 'cpp,java,python',
        extraTime: 0,
      });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [contest]);

  // 表单字段变更
  const handleChange = (field: keyof Contest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 日期时间变更处理
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      handleChange('startTime', date.toISOString());
    } else {
      handleChange('startTime', '');
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      handleChange('endTime', date.toISOString());
    } else {
      handleChange('endTime', '');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 验证表单
      if (!formData.title || !formData.description || !formData.startTime || !formData.endTime) {
        toast({
          title: '错误',
          description: '请填写所有必填字段',
          variant: 'destructive',
        });
        return;
      }

      // 验证结束时间晚于开始时间
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        toast({
          title: '错误',
          description: '结束时间必须晚于开始时间',
          variant: 'destructive',
        });
        return;
      }

      // 编辑或添加
      if (contest) {
        await contestApi.edit(formData);
        toast({
          title: '成功',
          description: '比赛已更新',
        });
      } else {
        await contestApi.add(formData);
        toast({
          title: '成功',
          description: '比赛已创建',
        });
      }

      // 关闭对话框并刷新数据
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({
        title: '错误',
        description: '保存失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{contest ? '编辑比赛' : '创建比赛'}</DialogTitle>
          <DialogDescription>
            {contest ? '修改比赛详情和配置' : '添加新的比赛并配置相关设置'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 比赛标题 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              比赛标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              className="col-span-3"
              placeholder="请输入比赛标题"
            />
          </div>

          {/* 比赛描述 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              比赛描述 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              className="col-span-3"
              placeholder="请输入比赛描述"
              rows={3}
            />
          </div>

          {/* 比赛类型 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              比赛类型 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type?.toString()}
              onValueChange={value => handleChange('type', parseInt(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择比赛类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CONTEST_TYPES.ACM.toString()}>ACM</SelectItem>
                <SelectItem value={CONTEST_TYPES.IOI.toString()}>IOI</SelectItem>
                <SelectItem value={CONTEST_TYPES.FRESH_CUP.toString()}>FreshCup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 开始时间 - 使用DateTimePicker */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              开始时间 <span className="text-destructive">*</span>
            </Label>
            <div className="col-span-3">
              <DateTimePicker date={startDate} setDate={handleStartDateChange} />
            </div>
          </div>

          {/* 结束时间 - 使用DateTimePicker */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              结束时间 <span className="text-destructive">*</span>
            </Label>
            <div className="col-span-3">
              <DateTimePicker date={endDate} setDate={handleEndDateChange} />
            </div>
          </div>

          {/* 允许的编程语言 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              编程语言
            </Label>
            <Input
              id="language"
              value={formData.language || ''}
              onChange={e => handleChange('language', e.target.value)}
              className="col-span-3"
              placeholder="例如：cpp,java,python"
            />
          </div>

          {/* 额外时间 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="extraTime" className="text-right">
              额外时间
            </Label>
            <Input
              id="extraTime"
              type="number"
              min="0"
              value={formData.extraTime?.toString() || '0'}
              onChange={e => handleChange('extraTime', parseInt(e.target.value) || 0)}
              className="col-span-3"
              placeholder="解释型语言补偿时间倍数"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : contest ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

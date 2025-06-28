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
import { problemApi } from '@/lib/api';
import { Problem } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

interface ProblemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  problem?: Problem; // 如果是编辑模式，则传入题目对象
  contestId?: string; // 如果是在比赛中添加题目，则传入比赛ID
}

interface ProblemType {
  id: string;
  name: string;
  slug: string;
  description: string;
  judge: string;
}

export function ProblemFormDialog({
  open,
  onOpenChange,
  onSuccess,
  problem,
  contestId,
}: ProblemFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [formData, setFormData] = useState<Partial<Problem>>({
    title: '',
    content: '',
    point: 100,
    contestId: contestId,
    index: 0,
    config: '{}',
    typeId: '',
    visibility: 'Private',
    metadata: {},
    ownerId: 1, // 默认为系统管理员
  });

  // 加载题目类型
  useEffect(() => {
    const loadProblemTypes = async () => {
      try {
        const response = await problemApi.getTypes();
        setProblemTypes(response.types || []);

        // 如果没有默认选中的类型且有题目类型数据，默认选中第一个
        if (!formData.typeId && response.types && response.types.length > 0) {
          setFormData(prev => ({ ...prev, typeId: response.types[0].id }));
        }
      } catch {
        toast({
          title: '错误',
          description: '无法加载题目类型',
          variant: 'destructive',
        });
      }
    };

    if (open) {
      loadProblemTypes();
    }
  }, [open, toast, formData.typeId]);

  // 当编辑对象改变时，初始化表单
  useEffect(() => {
    if (problem) {
      setFormData({
        id: problem.id,
        title: problem.title,
        content: problem.content,
        point: problem.point,
        contestId: problem.contestId,
        caseVersion: problem.caseVersion,
        index: problem.index,
        config: problem.config,
        typeId: problem.typeId,
        metadata: problem.metadata || {},
        ownerId: problem.ownerId,
        visibility: problem.visibility,
      });
    } else {
      // 重置表单，保留比赛ID
      setFormData({
        title: '',
        content: '',
        point: 100,
        contestId: contestId,
        index: 0,
        config: '{}',
        typeId: problemTypes.length > 0 ? problemTypes[0].id : '',
        visibility: 'Private',
        metadata: {},
        ownerId: 1,
      });
    }
  }, [problem, contestId, problemTypes]);

  // 表单字段变更
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 验证表单
      if (!formData.title || !formData.content) {
        toast({
          title: '错误',
          description: '请填写所有必填字段',
          variant: 'destructive',
        });
        return;
      }

      // 编辑或添加
      if (problem && formData.id) {
        await problemApi.edit(formData);
        toast({
          title: '成功',
          description: '题目已更新',
        });
      } else {
        await problemApi.add(formData);
        toast({
          title: '成功',
          description: '题目已创建',
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
          <DialogTitle>{problem ? '编辑题目' : '创建题目'}</DialogTitle>
          <DialogDescription>
            {problem ? '修改题目详情和配置' : '添加新的题目并配置相关设置'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 题目标题 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              题目标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              className="col-span-3"
              placeholder="请输入题目标题"
            />
          </div>

          {/* 题目类型 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              题目类型 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.typeId?.toString() || ''}
              onValueChange={value => handleChange('type_id', value)}
            >
              <SelectTrigger id="type" className="col-span-3">
                <SelectValue placeholder="选择题目类型" />
              </SelectTrigger>
              <SelectContent>
                {problemTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} - {type.judge}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 题目分值 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="point" className="text-right">
              题目分值 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="point"
              type="number"
              value={formData.point || 100}
              onChange={e => handleChange('point', parseInt(e.target.value))}
              className="col-span-3"
              placeholder="请输入题目分值"
            />
          </div>

          {/* 可见性 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visability" className="text-right">
              可见性 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.visibility?.toString() || '0'}
              onValueChange={value => handleChange('visability', parseInt(value))}
            >
              <SelectTrigger id="visability" className="col-span-3">
                <SelectValue placeholder="选择可见性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">私有</SelectItem>
                <SelectItem value="1">公开</SelectItem>
                <SelectItem value="2">仅特定比赛</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 题目内容 (Markdown) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              题目内容 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              className="col-span-3 min-h-[200px]"
              placeholder="请使用Markdown格式输入题目内容"
            />
          </div>

          {/* 配置 (JSON) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="config" className="text-right pt-2">
              题目配置 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="config"
              value={formData.config || '{}'}
              onChange={e => handleChange('config', e.target.value)}
              className="col-span-3 font-mono text-sm"
              placeholder='请输入JSON格式的题目配置，例如：{"time_limit": 1000, "memory_limit": 256}'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

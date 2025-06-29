'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { problemApi } from '@/lib/api';
import { Problem, ProblemListResponse } from '@/lib/schemas';
import { ProblemFormDialog } from '@/components/admin/problem-form-dialog';
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

interface ProblemType {
  id: string;
  name: string;
  slug: string;
  description: string;
  judge: string;
}

export function ProblemsInContestClient() {
  const params = useParams();
  const contestId = params.contestId as string;

  const { toast } = useToast();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
  });

  // 对话框状态
  const [problemFormOpen, setProblemFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<Problem | undefined>();

  // 加载题目类型
  const loadProblemTypes = async () => {
    try {
      const response = await problemApi.getTypes();
      setProblemTypes(response.types || []);
    } catch {
      toast({
        title: '错误',
        description: '无法加载题目类型',
        variant: 'destructive',
      });
    }
  };

  // 加载题目列表
  const loadProblems = useCallback(async () => {
    try {
      setLoading(true);
      const response: ProblemListResponse = await problemApi.getList({
        current: pagination.current,
        size: pagination.size,
        contest_id: contestId, // 始终使用URL中的contestId
      });

      setProblems(response.problems);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch {
      toast({
        title: '错误',
        description: '加载题目列表失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.size, contestId, toast]);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      await loadProblemTypes();
      loadProblems();
    };

    initData();
  }, [loadProblems]);

  // 编辑题目
  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setProblemFormOpen(true);
  };

  // 删除题目
  const handleDeleteProblem = async () => {
    if (!problemToDelete) return;

    try {
      await problemApi.delete(problemToDelete.id);
      toast({
        title: '成功',
        description: '题目已删除',
      });
      loadProblems();
    } catch {
      toast({
        title: '错误',
        description: '删除题目失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setProblemToDelete(undefined);
    }
  };

  // 确认删除
  const confirmDelete = (problem: Problem) => {
    setProblemToDelete(problem);
    setDeleteDialogOpen(true);
  };

  // 表单成功回调
  const handleFormSuccess = () => {
    loadProblems();
    setEditingProblem(undefined);
  };

  // 获取题目类型名称
  const getProblemTypeName = (typeId?: string) => {
    if (!typeId) return '未知';
    const type = problemTypes.find(t => t.id === typeId);
    if (!type) return `类型(ID: ${typeId})`;
    return `${type.name} (${type.judge})`;
  };

  // 获取可见性状态显示
  const getVisibilityDisplay = (visibility?: string) => {
    switch (visibility) {
      case 'Private':
        return <Badge variant="secondary">私有</Badge>;
      case 'Public':
        return <Badge variant="default">公开</Badge>;
      case 'Contest':
        return <Badge variant="outline">仅比赛</Badge>;
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
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{pagination.total} 个题目</Badge>
        </div>

        <Button onClick={() => setProblemFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加题目
        </Button>
      </div>

      {/* 题目列表 */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>分值</TableHead>
            <TableHead>可见性</TableHead>
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
          ) : problems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            problems.map(problem => (
              <TableRow key={problem.id}>
                <TableCell className="font-mono">{problem.id}</TableCell>
                <TableCell className="font-medium">{problem.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getProblemTypeName(problem.typeId)}</Badge>
                </TableCell>
                <TableCell>{problem.point}</TableCell>
                <TableCell>{getVisibilityDisplay(problem.visibility)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProblem(problem)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(problem)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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

      {/* 题目表单对话框 */}
      <ProblemFormDialog
        open={problemFormOpen}
        onOpenChange={setProblemFormOpen}
        onSuccess={handleFormSuccess}
        problem={editingProblem}
        contestId={contestId} // 传递contestId到表单
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除题目 &quot;{problemToDelete?.title}&quot; 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProblem}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

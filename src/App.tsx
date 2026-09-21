import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, LayoutDashboard, List, CheckCircle2, Clock, AlertTriangle, TrendingUp, CalendarDays } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TodoList } from '@/components/TodoList';
import { TodoForm } from '@/components/TodoForm';
import { Pagination } from '@/components/Pagination';
import { fetchTodos, createTodo, updateTodo, deleteTodo, completeTodo } from '@/api/todos';
import type { TodoCreate, Todo } from '@/types/todo';

function App() {
  const queryClient = useQueryClient();

  const [view, setView] = useState<'board' | 'list'>('list');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('due_date');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: todosResponse, isLoading, error } = useQuery({
    queryKey: ['todos', search, filter, categoryFilter, sortBy, page],
    queryFn: () =>
      fetchTodos({
        search: search || undefined,
        status: filter !== 'all' ? filter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sort_by: sortBy,
        page,
        page_size: 10,
      }),
  });

  const items = todosResponse?.items ?? [];
  const totalCount = todosResponse?.total ?? 0;

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((t) => t.is_completed).length;
    const pending = items.filter((t) => !t.is_completed).length;
    const highPriority = items.filter((t) => t.priority === 'high').length;
    const overdue = items.filter((t) => {
      if (t.is_completed || !t.due_date) return false;
      try {
        const d = new Date(t.due_date);
        return d < new Date();
      } catch {
        return false;
      }
    }).length;
    return { total, completed, pending, overdue, highPriority };
  }, [items]);

  const completionRate = useMemo(() => {
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  }, [stats]);

  const categoryOptions = useMemo(() => {
    const cats = new Set(items.map((t) => t.category));
    return Array.from(cats).sort();
  }, [items]);

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      toast.success('할 일이 추가되었습니다');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => toast.error('추가에 실패했습니다'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TodoCreate }) => updateTodo(id, data),
    onSuccess: () => {
      toast.success('수정되었습니다');
      setIsEditOpen(false);
      setEditingTodo(null);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => toast.error('수정에 실패했습니다'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      toast.success('삭제되었습니다');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => toast.error('삭제에 실패했습니다'),
  });

  const completeMutation = useMutation({
    mutationFn: completeTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => toast.error('상태 변경에 실패했습니다'),
  });

  const handleCreate = (data: TodoCreate) => {
    createMutation.mutate(data);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditOpen(true);
  };

  const handleUpdate = (data: TodoCreate) => {
    if (!editingTodo) return;
    updateMutation.mutate({ id: editingTodo.id, data });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggle = (id: number) => {
    completeMutation.mutate(id);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">할 일 관리</h1>
              <p className="text-muted-foreground mt-1">카테고리, 마감일, 우선순위로 정리하세요</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                새 할 일
              </Button>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>새 할 일 추가</DialogTitle>
                </DialogHeader>
                <TodoForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} submitLabel="추가" />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  전체
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  완료
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  마감 임박/지남
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdue}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  달성률
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as 'board' | 'list')}>
              <TabsList>
                <TabsTrigger value="list">
                  <List className="w-4 h-4 mr-1" />
                  목록
                </TabsTrigger>
                <TabsTrigger value="board">
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  보드
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-1 lg:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">미완료</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full sm:w-36">
                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date">마감일</SelectItem>
                <SelectItem value="priority">우선순위</SelectItem>
                <SelectItem value="created_at">생성일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center text-destructive border border-destructive/20 rounded-xl bg-destructive/5">
            데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
          </div>
        ) : (
          <>
            <TodoList
              todos={items}
              isLoading={isLoading}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="mt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </main>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>할 일 수정</DialogTitle>
          </DialogHeader>
          {editingTodo && (
            <TodoForm
              onSubmit={handleUpdate}
              defaultValues={editingTodo}
              onCancel={() => setIsEditOpen(false)}
              submitLabel="저장"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertCircle, CalendarDays } from 'lucide-react';
import type { Todo } from '@/types/todo';

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

const priorityConfig = {
  low: { label: '낮음', color: 'bg-secondary text-secondary-foreground' },
  medium: { label: '보통', color: 'bg-accent text-accent-foreground' },
  high: { label: '높음', color: 'bg-destructive text-destructive-foreground' },
};

const categoryLabels: Record<string, string> = {
  work: '업무',
  personal: '개인',
  study: '학습',
  health: '건강',
  finance: '금융',
  shopping: '쇼핑',
  other: '기타',
};

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!todo) return null;

  const isOverdue = !todo.is_completed && todo.due_date ? new Date(todo.due_date) < new Date() : false;

  const dueLabel = todo.due_date
    ? new Date(todo.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : null;

  const priority = priorityConfig[todo.priority ?? 'medium'];

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
        todo.is_completed
          ? 'bg-muted/40 border-border/60'
          : isOverdue
          ? 'bg-destructive/5 border-destructive/30'
          : 'bg-card border-border hover:border-primary/20 hover:shadow-sm'
      }`}
    >
      <Checkbox
        checked={todo.is_completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${todo.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {todo.title}
          </span>
          <Badge variant="outline" className={`text-xs ${priority.color}`}>
            {priority.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[todo.category] ?? todo.category}
          </Badge>
        </div>

        {todo.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{todo.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {dueLabel && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
              <CalendarDays className="w-3.5 h-3.5" />
              {dueLabel}
              {isOverdue && <span>(마감 지남)</span>}
            </span>
          )}
          {isOverdue && !todo.is_completed && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="w-3.5 h-3.5" />
              마감 임박
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={() => onEdit(todo)} className="h-8 w-8">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => {
            if (isDeleting) return;
            setIsDeleting(true);
            onDelete(todo.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

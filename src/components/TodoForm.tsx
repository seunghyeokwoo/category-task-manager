import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Tag, AlertCircle } from 'lucide-react';
import type { Todo } from '@/types/todo';

const formSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['work', 'personal', 'study', 'health', 'finance', 'shopping', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
});

export type TodoFormValues = z.infer<typeof formSchema>;

export interface TodoFormProps {
  onSubmit: (data: TodoFormValues) => void;
  defaultValues?: Todo | null;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TodoForm({ onSubmit, defaultValues, onCancel, submitLabel = '저장' }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title ?? '',
          description: defaultValues.description ?? '',
          category: defaultValues.category ?? 'work',
          priority: defaultValues.priority ?? 'medium',
          due_date: defaultValues.due_date
            ? new Date(defaultValues.due_date).toISOString().split('T')[0]
            : '',
        }
      : {
          title: '',
          description: '',
          category: 'work',
          priority: 'medium',
          due_date: '',
        },
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          placeholder="할 일 제목"
          {...form.register('title')}
          className={form.formState.errors.title ? 'border-destructive' : ''}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="상세 설명 (선택)"
          rows={3}
          {...form.register('description')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            카테고리
          </Label>
          <Select
            value={form.watch('category')}
            onValueChange={(v) => form.setValue('category', v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">업무</SelectItem>
              <SelectItem value="personal">개인</SelectItem>
              <SelectItem value="study">학습</SelectItem>
              <SelectItem value="health">건강</SelectItem>
              <SelectItem value="finance">금융</SelectItem>
              <SelectItem value="shopping">쇼핑</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            우선순위
          </Label>
          <Select
            value={form.watch('priority')}
            onValueChange={(v) => form.setValue('priority', v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">낮음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="high">높음</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" />
            마감일
          </Label>
          <Input type="date" {...form.register('due_date')} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

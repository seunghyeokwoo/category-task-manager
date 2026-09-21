export interface TodoItem {
  id: number;
  title: string;
  description: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTodos {
  items: TodoItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface FetchTodosParams {
  search?: string;
  status?: 'active' | 'completed';
  category?: string;
  sort_by?: 'due_date' | 'priority' | 'created_at';
  page?: number;
  page_size?: number;
}

const API_BASE = 'http://localhost:8000';

export async function fetchTodos(params?: FetchTodosParams): Promise<PaginatedTodos> {
  const url = new URL(`${API_BASE}/api/todos`);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.category) url.searchParams.set('category', params.category);
  if (params?.sort_by) url.searchParams.set('sort_by', params.sort_by);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.page_size) url.searchParams.set('page_size', String(params.page_size));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.status}`);
  }
  const data = await response.json();
  if (!data || typeof data !== 'object') {
    return { items: [], total: 0, page: 1, page_size: 10 };
  }
  if (!Array.isArray(data.items)) {
    data.items = [];
  }
  return data;
}

export async function createTodo(todo: {
  title: string;
  description?: string;
  category: string;
  priority: string;
  due_date?: string | null;
}): Promise<TodoItem> {
  const response = await fetch(`${API_BASE}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.status}`);
  }
  return response.json();
}

export async function updateTodo(
  id: number,
  todo: {
    title: string;
    description?: string;
    category: string;
    priority: string;
    due_date?: string | null;
  }
): Promise<TodoItem> {
  const response = await fetch(`${API_BASE}/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.status}`);
  }
  return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/todos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.status}`);
  }
}

export async function completeTodo(id: number): Promise<TodoItem> {
  const response = await fetch(`${API_BASE}/api/todos/${id}/complete`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to complete todo: ${response.status}`);
  }
  return response.json();
}

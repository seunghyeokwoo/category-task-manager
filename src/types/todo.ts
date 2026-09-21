export interface Todo {
  id: number;
  title: string;
  description: string | null;
  category: "업무" | "개인" | "학습" | "쇼핑" | "기타";
  priority: "높음" | "중간" | "낮음";
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string | null;
  category: "업무" | "개인" | "학습" | "쇼핑" | "기타";
  priority: "높음" | "중간" | "낮음";
  due_date?: string | null;
  completed?: boolean;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  category?: "업무" | "개인" | "학습" | "쇼핑" | "기타";
  priority?: "높음" | "중간" | "낮음";
  due_date?: string | null;
  completed?: boolean;
}

export interface TodoListResponse {
  items: Todo[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const CATEGORIES: Todo["category"][] = ["업무", "개인", "학습", "쇼핑", "기타"];
export const PRIORITIES: Todo["priority"][] = ["높음", "중간", "낮음"];

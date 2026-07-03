import type { ReactNode } from "react";

// ========================================
// Authentication
// ========================================

export type AuthData = {
  username: string;
  email: string;
  password: string;
};

export type AuthFormProps = {
  title: string;
  buttonText: string;
  isRegister: boolean;
  onSubmit: (data: AuthData) => void | Promise<void>;
  error: string | null;
  success: string | null;
};

export type AuthContextType = {
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
};

export type AuthProviderProps = {
  children: ReactNode;
};

// ========================================
// Todo
// ========================================

export type TodoData = {
  id: number;
  user_id: number;
  title: string;
  task: string;
  task_date: string;
  is_completed: boolean;
};

export type Todo = TodoData & {
  created_at: string;
  updated_at: string;
};

export type TodoFormProps = {
  onClose: () => void;
  onSubmit: (data: Omit<TodoData, "id" | "user_id">) => void;
  initialData?: Omit<TodoData, "id" | "user_id">;
  formTitle?: string;
  error?: string | null;
  success?: string | null;
};

// ========================================
// Components
// ========================================

export type FloatingButtonProps = {
  floatingButtonClick: () => void;
};

export type CardProps = {
  title: string;
  details: string;
  datetime: Date;
  onClick: () => void;
  onUpdate: () => void;
  onDelete: () => void;
};

export type CreatePageProps = {
  onClose: () => void;
  onCreated: () => void;
};

export type NoticeProps = {
  title: string;
  message: ReactNode;
  type: "info" | "success" | "warning" | "error";
};

export type ViewPageData = {
  id: number;
  title: string;
  task: string;
  task_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ViewPageProps = {
  onClose: () => void;
  todoId: number;
};

export type UpdatePageData = {
  id?: number;
  user_id?: number;
  title?: string;
  task?: string;
  task_date?: string;
  is_completed?: boolean;
};

export type UpdatePageProps = {
  todo: Todo;
  onClose: () => void;
  onUpdate: (data: Omit<UpdatePageData, "id" | "user_id">) => void;
};

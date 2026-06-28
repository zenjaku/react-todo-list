// Global Interfaces

import type { ReactNode } from "react";

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  task: string;
  task_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthData {
  username: string;
  email: string;
  password: string;
}

export interface AuthFormProps {
  title: string;
  buttonText: string;
  isRegister: boolean;
  onSubmit: (data: AuthData) => void | Promise<void>;
  error: string | null;
  success: string | null;
}

export interface AuthContextType {
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface TodoData {
  id: number;
  user_id: number;
  title: string;
  task: string;
  task_date: string;
  is_completed: boolean;
}

export interface TodoFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<TodoData, "id" | "user_id">) => void;
  formTitle?: string;
  error?: string | null;
  success?: string | null;
}

export interface FloatingButtonProps {
  floatingButtonClick: () => void;
}

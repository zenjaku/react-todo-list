// Global Interfaces

import type { ReactNode } from "react";

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  task: string;
  is_completed: 0 | 1;
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

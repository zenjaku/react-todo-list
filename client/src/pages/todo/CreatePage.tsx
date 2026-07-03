
import { useState } from "react";
import type { CreatePageProps, TodoData } from "../../type";
import { TodoForm } from "../../components/TodoForm";
import { useAuth } from "../../context/AuthContext";

export function CreatePage({ onClose, onCreated }: CreatePageProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token, userId } = useAuth();
  const currentUserId = userId;

  const handleCreateTodo = async (data: Omit<TodoData, "id" | "user_id">) => {
    setError(null);
    setSuccess(null);

    if (!token || !currentUserId) return;
    try {
      const response = await fetch(`${apiUrl}/todo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          task: data.task,
          task_date: data.task_date,
          is_completed: data.is_completed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Saving failed");
      }

      setSuccess("Saved Successfully!");
      console.log(result);
      setTimeout(() => {
        onClose();
        onCreated();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occured.");
    }
  };
  return (
    <>
      <div className="container">
        <TodoForm onClose={onClose} onSubmit={handleCreateTodo} formTitle="Add Todo" error={error} success={success} />
      </div>
    </>
  );
}

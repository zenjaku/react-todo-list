import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import type { Todo, UpdatePageData } from "../type";
import { useAuth } from "../context/AuthContext";
import { ViewPage } from "./todo/ViewPage";
import { UpdatePage } from "./todo/UpdatePage";

export type TodoListProps = {
  refreshTrigger?: number;
};

export function TodoList({ refreshTrigger }: TodoListProps) {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchTodos = () => {
    if (!token) return;
    fetch(`${apiUrl}/todo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setTodoList(data);
      })
      .catch((err) => {
        console.error("Failed to fetch todos: ", err);
      });
  };

  useEffect(() => {
    fetchTodos();
  }, [token, refreshTrigger]);

  const handleUpdate = async (todoId: number, data: Omit<UpdatePageData, "id" | "user_id">) => {
    try {
      const response = await fetch(`${apiUrl}/todo/update/${todoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Update failed");
      }

      fetchTodos();
      setEditingTodo(null);
    } catch (err) {
      console.error("Update failed: ", err);
    }
  };

  const handleDelete = async (todoId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/todo/delete/${todoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchTodos();
    } catch (err) {
      console.error("Delete failed: ", err);
    }
  };

  return (
    <div>
      <div className="card-container">
        {todoList.map((todo) => (
          <Card
            key={todo.id}
            title={`${todo.title} • ${new Date(todo.task_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`}
            details={todo.task}
            datetime={todo.created_at ? new Date(todo.created_at) : new Date(todo.updated_at)}
            onClick={() => setSelectedTodo(todo.id)}
            onUpdate={() => setEditingTodo(todo)}
            onDelete={() => handleDelete(todo.id)}
          />
        ))}
      </div>

      {selectedTodo !== null && <ViewPage todoId={selectedTodo} onClose={() => setSelectedTodo(null)} />}
      {editingTodo && (
        <UpdatePage
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdate={(data) => handleUpdate(editingTodo.id, data)}
        />
      )}
    </div>
  );
}

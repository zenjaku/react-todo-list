import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import type { Todo } from "../type";
import { useAuth } from "../context/AuthContext";
import { ViewPage } from "./todo/ViewPage";

export type TodoListProps = {
  refreshTrigger?: number;
};

export function TodoList({ refreshTrigger }: TodoListProps) {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null);
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

  return (
    <div>
      <div className="card-container">
        {todoList.length === 0 ? (
          <p className="no-data">Your notepad is empty! Click the button in the corner to add your first task.</p>
        ) : (
          todoList.map((todo) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [year, month, day] = todo.task_date.split("-").map(Number);
            const taskDateLocal = new Date(year, month - 1, day);

            const isOverdue = !todo.is_completed && taskDateLocal < today;

            return (
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
                isCompleted={todo.is_completed}
                isOverdue={isOverdue}
              />
            );
          })
        )}
      </div>

      {selectedTodo !== null && (
        <ViewPage todoId={selectedTodo} onClose={() => setSelectedTodo(null)} onRefresh={fetchTodos} />
      )}
    </div>
  );
}

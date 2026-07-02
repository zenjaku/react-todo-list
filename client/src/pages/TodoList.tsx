import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import type { Todo } from "../type";
import { useAuth } from "../context/AuthContext";
import { ViewPage } from "./todo/ViewPage";

export function TodoList() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null);
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
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
      .catch((error) => {
        console.error("Failed to fetch todos: ", error);
      });
  }, [token]);
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
          />
        ))}
      </div>

      {selectedTodo !== null && <ViewPage todoId={selectedTodo} onClose={() => setSelectedTodo(null)} />}
    </div>
  );
}

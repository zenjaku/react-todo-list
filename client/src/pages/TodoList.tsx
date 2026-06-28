import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import type { Todo } from "../interface";
import { useAuth } from "../context/AuthContext";

export function TodoList() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const { token, userId } = useAuth();
  const currentUserId = userId;
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token || !currentUserId) return;
    fetch(`${apiUrl}/todo/${currentUserId}`, {
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
  }, [token, currentUserId]);
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
          />
        ))}
      </div>
    </div>
  );
}

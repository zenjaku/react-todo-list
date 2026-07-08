import { useEffect, useState } from "react";
import type React from "react";
import { Card } from "../components/Card";
import type { Todo } from "../type";
import { useAuth } from "../context/AuthContext";
import { ViewPage } from "./todo/ViewPage";
import { ConfirmModal } from "../components/ConfirmModal";

type FilterType = "all" | "pending" | "completed" | "overdue";

export function TodoList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [quickTitle, setQuickTitle] = useState("");
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchTodos = () => {
    if (!token) return;
    fetch(`${apiUrl}/todo`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTodoList(data);
        } else {
          console.error("Expected an array of todos, but received:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch todos: ", err));
  };

  useEffect(() => {
    fetchTodos();
  }, [token, refreshTrigger]);

  const toggleComplete = async (todo: Todo, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      await fetch(`${apiUrl}/todo/update/${todo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_completed: !todo.is_completed }),
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskField = async (todoId: number, updatedTaskJson: string) => {
    try {
      await fetch(`${apiUrl}/todo/update/${todoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: updatedTaskJson }),
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = (todoId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setDeletingTodoId(todoId);
  };

  const executeDelete = async () => {
    if (deletingTodoId === null) return;
    try {
      await fetch(`${apiUrl}/todo/delete/${deletingTodoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingTodoId(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTodos = todoList.filter((todo) => {
    const [year, month, day] = todo.task_date.split("-").map(Number);
    const taskDateLocal = new Date(year, month - 1, day);
    const isOverdue = !todo.is_completed && taskDateLocal < today;

    if (filter === "pending") return !todo.is_completed;
    if (filter === "completed") return todo.is_completed;
    if (filter === "overdue") return isOverdue;
    return true;
  });

  return (
    <div className="todo-notebook">

      <div className="todo-filter-tabs">
        {(["all", "pending", "completed", "overdue"] as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`filter-tab ${filter === t ? "active" : ""}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="todo-list-rows">
        {filteredTodos.length === 0 ? (
          <p className="no-data">No todo items found.</p>
        ) : (
          filteredTodos.map((todo) => {
            const [year, month, day] = todo.task_date.split("-").map(Number);
            const taskDateLocal = new Date(year, month - 1, day);
            const isOverdue = !todo.is_completed && taskDateLocal < today;

            return (
              <Card
                key={todo.id}
                id={todo.id}
                title={todo.title}
                task={todo.task}
                datetime={new Date(todo.task_date)}
                isCompleted={todo.is_completed}
                isOverdue={isOverdue}
                onRowClick={() => setSelectedTodo(todo.id)}
                onToggleComplete={(e) => toggleComplete(todo, e)}
                onUpdateTaskField={(json) => updateTaskField(todo.id, json)}
                onDeleteClick={(e) => deleteTodo(todo.id, e)}
              />
            );
          })
        )}
      </div>

      {selectedTodo !== null && (
        <ViewPage todoId={selectedTodo} onClose={() => setSelectedTodo(null)} onRefresh={fetchTodos} />
      )}

      <ConfirmModal
        isOpen={deletingTodoId !== null}
        title="Discard Task"
        message="Are you sure you want to delete this task? This note will be lost forever!"
        onConfirm={executeDelete}
        onCancel={() => setDeletingTodoId(null)}
      />
    </div>
  );
}


import { useEffect, useState } from "react";
import type { ViewPageData, ViewPageProps } from "../../type";
import { useAuth } from "../../context/AuthContext";

export function ViewPage({ todoId, onClose }: ViewPageProps) {
  const [todo, setTodo] = useState<ViewPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/todo/${todoId}`, {
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
        setTodo(data.todo);
      })
      .catch((error) => {
        console.error("Failed to fetch todo: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, todoId, apiUrl]);

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="view-modal" onClick={(e) => e.stopPropagation()}>
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="view-modal-header">
            <h2>Error</h2>
            <button className="view-modal-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <p>No todo found.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTaskDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="view-modal-header">
            <h2>{todo.title}</h2>
            <button className="view-modal-close" aria-label="Close" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="view-modal-body">
            <div className="view-modal-task-title">Task Description</div>
            <div className="view-modal-task-desc">{todo.task}</div>
          </div>

          <div className="view-modal-meta">
            <div className="view-modal-meta-item">
              <span className="view-modal-meta-label">Due Date</span>
              <span className="view-modal-meta-value">{formatTaskDate(todo.task_date)}</span>
            </div>

            <div className="view-modal-meta-item">
              <span className="view-modal-meta-label">Status</span>
              <span className={`status-badge ${todo.is_completed ? "completed" : "pending"}`}>
                {todo.is_completed ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="view-modal-meta-item">
              <span className="view-modal-meta-label">Created At</span>
              <span className="view-modal-meta-value">{formatDate(todo.created_at)}</span>
            </div>

            <div className="view-modal-meta-item">
              <span className="view-modal-meta-label">Last Updated</span>
              <span className="view-modal-meta-value">{todo.updated_at ? formatDate(todo.updated_at) : "Never"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

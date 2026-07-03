import { useEffect, useState } from "react";
import type { ViewPageData, ViewPageProps, UpdatePageData } from "../../type";
import { useAuth } from "../../context/AuthContext";
import { UpdatePage } from "./UpdatePage";

export function ViewPage({ todoId, onClose, onRefresh }: ViewPageProps) {
  const [todo, setTodo] = useState<ViewPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
  }, [token, todoId, apiUrl, refreshKey]);

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

  const handleUpdate = async (data: Omit<UpdatePageData, "id" | "user_id">) => {
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

      setRefreshKey((prev) => prev + 1);
      onRefresh();
      setIsUpdating(false);
    } catch (err) {
      console.error("Update failed: ", err);
    }
  };

  const handleDelete = async () => {
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

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Delete failed: ", err);
    }
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

          <div className="view-modal-actions">
            <button className="update-btn" onClick={() => setIsUpdating(true)}>Update</button>
            <button className="delete-btn" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>

      {isUpdating && (
        <UpdatePage
          todo={todo as any}
          onClose={() => setIsUpdating(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}

import { useState } from "react";
import type { TodoFormProps } from "../type";

export function TodoForm({ onClose, formTitle, onSubmit, error, success, initialData }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [task, setTask] = useState(initialData?.task || "");

  const formatForInputDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0]; // returns YYYY-MM-DD
  };

  const [taskDate, setTaskDate] = useState(formatForInputDate(initialData?.task_date));
  const [isCompleted, setIsCompleted] = useState(initialData?.is_completed || false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ title, task, task_date: taskDate, is_completed: isCompleted ? true : false });
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal">
          <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
              <h2>{formTitle}</h2>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <input
                type="text"
                placeholder="Task Title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="auth-input"
                required
              />

              <textarea
                placeholder="Details / Description"
                name="task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="auth-input"
                required
              ></textarea>

              <input
                type="date"
                name="taskDate"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="auth-input"
                required
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  alignSelf: "flex-start",
                }}
              >
                <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} />
                Completed
              </label>

              <div className="todo-form-btns" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="submit" className="submit-btn">
                  Save Todo
                </button>
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

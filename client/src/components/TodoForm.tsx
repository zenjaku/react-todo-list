import { useEffect, useRef, useState } from "react";
import type { TodoFormProps } from "../interface";

export function TodoForm({ onClose, formTitle, onSubmit, error, success }: TodoFormProps) {
  const todoFormRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [taskDate, setTaskDate] = useState("");

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (todoFormRef.current && !todoFormRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ title, task, task_date: taskDate, is_completed: isCompleted ? true : false });
  };

  return (
    <>
      <div className="modal-overlay">
        <div ref={todoFormRef} className="modal">
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

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="submit">Save Todo</button>
                <button type="button" onClick={onClose} style={{ backgroundColor: "gray" }}>
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

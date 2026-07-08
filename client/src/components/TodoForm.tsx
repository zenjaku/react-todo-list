import { useState } from "react";
import type { TodoFormProps, ChecklistItem } from "../type";
import { parseChecklist } from "../utils/todoHelpers";

export function TodoForm({ onClose, formTitle, onSubmit, error, success, initialData }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [isCompleted, setIsCompleted] = useState(initialData?.is_completed || false);
  const [newItemText, setNewItemText] = useState("");

  const getInitialChecklist = (): ChecklistItem[] => {
    return parseChecklist(initialData?.task || "") || [];
  };

  const getInitialDescription = (): string => {
    const checklist = parseChecklist(initialData?.task || "");
    return checklist ? "" : initialData?.task || "";
  };

  const [isChecklistMode, setIsChecklistMode] = useState(
    getInitialChecklist().length > 0 || initialData?.task === undefined,
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(getInitialChecklist());
  const [description, setDescription] = useState(getInitialDescription());

  const formatForInputDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const [taskDate, setTaskDate] = useState(formatForInputDate(initialData?.task_date));

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      done: false,
    };
    setChecklist([...checklist, newItem]);
    setNewItemText("");
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskContent = isChecklistMode ? JSON.stringify(checklist) : description;

    onSubmit({
      title,
      task: taskContent,
      task_date: taskDate,
      is_completed: isCompleted,
    });
  };

  return (
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="auth-input"
              required
            />

            {/* Mode Switcher */}
            <div className="form-mode-selector">
              <button
                type="button"
                className={`mode-btn ${isChecklistMode ? "active" : ""}`}
                onClick={() => setIsChecklistMode(true)}
              >
                📋 Checklist Mode
              </button>
              <button
                type="button"
                className={`mode-btn ${!isChecklistMode ? "active" : ""}`}
                onClick={() => setIsChecklistMode(false)}
              >
                📝 Description Mode
              </button>
            </div>

            {isChecklistMode ? (
              <div className="checklist-editor">
                <div className="checklist-builder-input">
                  <input
                    type="text"
                    placeholder="Add item (e.g. Milk)"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="auth-input flex-grow"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                  />
                  <button type="button" onClick={addChecklistItem} className="add-subitem-btn">
                    Add
                  </button>
                </div>

                <div className="form-checklist-items">
                  {checklist.map((item) => (
                    <div key={item.id} className="form-checklist-row">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(e) => {
                          setChecklist(checklist.map((c) => (c.id === item.id ? { ...c, done: e.target.checked } : c)));
                        }}
                      />
                      <span className="checklist-item-text">{item.text}</span>
                      <button type="button" onClick={() => removeChecklistItem(item.id)} className="delete-subitem-btn">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <textarea
                placeholder="Details / Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="auth-input"
                style={{ minHeight: "100px" }}
              ></textarea>
            )}

            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="auth-input"
              min={new Date().toISOString().split("T")[0]}
              required
            />

            <label className="checkbox-label">
              <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} />
              Mark Entire Todo Completed
            </label>

            <div className="todo-form-btns">
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
  );
}

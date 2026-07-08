import type React from "react";
import type { CardProps } from "../type";
import { parseChecklist } from "../utils/todoHelpers";

export function Card({
  title,
  task,
  datetime,
  isCompleted,
  isOverdue,
  onRowClick,
  onToggleComplete,
  onUpdateTaskField,
  onDeleteClick,
}: CardProps) {
  const checklist = parseChecklist(task);

  const handleSubItemCheck = async (itemId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!checklist) return;

    const updated = checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item));

    await onUpdateTaskField(JSON.stringify(updated));
  };

  const completedCount = checklist ? checklist.filter((i) => i.done).length : 0;
  const totalCount = checklist ? checklist.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`todo-row-card ${isCompleted ? "completed" : ""}`} onClick={onRowClick}>
      <div className="todo-checkbox-wrapper" onClick={onToggleComplete}>
        <input type="checkbox" checked={isCompleted} readOnly className="todo-checkbox" />
      </div>

      <div className="todo-body-content">
        <div className="todo-header-line">
          <h3 className="todo-title">{title}</h3>

          <div className="todo-meta-actions">
            {isOverdue && <span className="overdue-badge">Overdue</span>}

            <span className="todo-date">
              {datetime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <button className="todo-row-delete-btn" onClick={(e) => onDeleteClick(e as any)}>
              &times;
            </button>
          </div>
        </div>

        {/* Render checklists or plain text fallbacks */}
        {checklist ? (
          <div className="todo-subtasks-section" onClick={(e) => e.stopPropagation()}>
            <div className="todo-progress-bar-wrapper">
              <div className="todo-progress-bar" style={{ width: `${progressPercent}%` }}></div>
              <span className="todo-progress-text">
                {completedCount}/{totalCount} completed
              </span>
            </div>

            <div className="todo-subtasks-list">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`todo-subtask-row ${item.done ? "sub-done" : ""}`}
                  onClick={(e) => handleSubItemCheck(item.id, e)}
                >
                  <input type="checkbox" className="todo-sub-checkbox" checked={item.done} readOnly />
                  <span className="todo-subtask-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          task && task !== "Quick added task" && <p className="todo-details-desc">{task}</p>
        )}
      </div>

      {!!isCompleted && <div className="completed-stamp">Completed</div>}
      {!!isOverdue && <div className="overdue-stamp">Overdue</div>}
    </div>
  );
}


import type { CardProps } from "../type";

export function Card({ title, details, datetime, onClick, isCompleted, isOverdue }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>

      <div className="card-body">
        <p>{details}</p>
      </div>

      <div className="card-footer">
        <span>{datetime.toLocaleString()}</span>
      </div>

      {!!isCompleted && <div className="completed-stamp">Completed</div>}
      {!!isOverdue && <div className="overdue-stamp">Overdue</div>}
    </div>
  );
}

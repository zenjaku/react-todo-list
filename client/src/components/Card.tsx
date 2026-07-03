import type { CardProps } from "../type";

export function Card({ title, details, datetime, onClick, onUpdate, onDelete }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <h3>{title}</h3>
        <div className="card-header-btns">
          <button onClick={(e) => { e.stopPropagation(); onUpdate(); }} className="update-btn">Update</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="delete-btn">Delete</button>
        </div>
      </div>

      <div className="card-body">
        <p>{details}</p>
      </div>

      <div className="card-footer">
        <span>{datetime.toLocaleString()}</span>
      </div>
    </div>
  );
}

import type { CardProps } from "../type";

export function Card({ title, details, datetime }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
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

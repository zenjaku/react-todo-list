import type { NoticeProps } from "../type";

export function Notice({ title, message, type = "info" }: NoticeProps) {
  return (
    <>
      <div className={`notice notice-${type}`}>
        <h3 className={`notice-title-${type}`}>{title}</h3>
        <div className="notice-message">{message}</div>
      </div>
    </>
  );
}

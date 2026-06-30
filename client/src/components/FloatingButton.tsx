import type { FloatingButtonProps } from "../type";

export function FloatingButton({ floatingButtonClick }: FloatingButtonProps) {
  return (
    <button className="floating-btn" onClick={floatingButtonClick}>
      Add Note
    </button>
  );
}

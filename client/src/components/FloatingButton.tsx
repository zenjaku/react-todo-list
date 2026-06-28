import type { FloatingButtonProps } from "../interface";

export function FloatingButton({ floatingButtonClick }: FloatingButtonProps) {
  return (
    <button className="floating-btn" onClick={floatingButtonClick}>
      Add Note
    </button>
  );
}

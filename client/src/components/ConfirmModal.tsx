import type { ReactNode } from "react";

export type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 600 }}>
      <div className="confirm-modal">
        {/* Red header strip */}
        <div className="confirm-modal-header-strip" />

        <h2>⚠️ {title}</h2>

        <div className="confirm-modal-message">
          {message}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="delete-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

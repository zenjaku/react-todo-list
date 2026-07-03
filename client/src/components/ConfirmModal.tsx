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
      <div
        className="modal"
        style={{
          maxWidth: "400px",
          backgroundColor: "#fff5f5", // Light pink warning paper
          border: "2px solid #a90000",
          backgroundImage: "linear-gradient(#ffe3e3 1px, transparent 1px)",
          backgroundSize: "100% 1.6rem",
          backgroundPosition: "0 0.8rem",
          lineHeight: "1.6rem",
          padding: "2.8rem 1.5rem 1.5rem 2rem",
          transform: "rotate(-1.6deg)", // slanted warning card effect
        }}
      >
        {/* Red header strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "12px",
            background: "#a90000",
            borderRadius: "4px 4px 0 0",
          }}
        />

        <h2
          style={{
            fontFamily: "Patrick Hand, Kalam, cursive",
            color: "#a90000",
            borderBottom: "2px solid #ffa3a3",
            paddingBottom: "0.3rem",
            marginBottom: "0.8rem",
            fontSize: "1.45rem",
          }}
        >
          ⚠️ {title}
        </h2>

        <div
          style={{
            fontFamily: "Patrick Hand, Kalam, cursive",
            fontSize: "1.1rem",
            color: "#3b3a36",
            marginBottom: "1.5rem",
          }}
        >
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

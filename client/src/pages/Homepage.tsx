import { useState } from "react";
import { FloatingButton } from "../components/FloatingButton";
import { TodoList } from "./TodoList";
import { CreatePage } from "./todo/CreatePage";

export function Homepage() {
  const [open, setOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div>
      <TodoList refreshTrigger={refreshCount} />
      {/* Floating Button */}
      <FloatingButton floatingButtonClick={() => setOpen(true)} />

      {open && (
        <CreatePage
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            setRefreshCount((prev) => prev + 1); // SILENT REFRESH: increment trigger
          }}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { FloatingButton } from "../components/FloatingButton";
import { TodoList } from "./TodoList";
import { CreatePage } from "./todo/CreatePage";

export function Homepage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <TodoList />
      {/* Floating Button */}
      <FloatingButton floatingButtonClick={() => setOpen(true)} />

      {open && <CreatePage onClose={() => setOpen(false)} />}
    </div>
  );
}

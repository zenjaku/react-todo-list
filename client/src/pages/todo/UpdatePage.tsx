import type { UpdatePageProps, TodoData } from "../../type";
import { TodoForm } from "../../components/TodoForm";

export function UpdatePage({ todo, onClose, onUpdate }: UpdatePageProps) {
  const handleSubmit = (data: Omit<TodoData, "id" | "user_id">) => {
    onUpdate(data);
  };

  return (
    <div className="container">
      <TodoForm
        onClose={onClose}
        onSubmit={handleSubmit}
        formTitle="Update Todo"
        initialData={todo}
      />
    </div>
  );
}

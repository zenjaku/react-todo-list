// import { TodoList } from "./TodoList";

import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";

export function Homepage() {
  return (
    <div>
      {/* <TodoList /> */}
      <LoginPage />
      <RegisterPage />
    </div>
  );
}

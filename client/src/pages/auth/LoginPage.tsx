import { AuthForm } from "../../components/AuthForm";
import { useAuth } from "../../context/AuthContext";
import type { AuthData } from "../../interface";

export function LoginPage() {
  const handleLogin = async (data: AuthData) => {
    try {
      const response = await fetch("http://localhost:9000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });
      
      const { login } = useAuth();

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      login(result.token);

      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div>
        <AuthForm title="Welcome Back" buttonText="Sign in" isRegister={false} onSubmit={handleLogin} />
      </div>
    </>
  );
}

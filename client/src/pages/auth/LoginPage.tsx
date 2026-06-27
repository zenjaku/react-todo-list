import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../components/AuthForm";
import { useAuth } from "../../context/AuthContext";
import type { AuthData } from "../../interface";
import { useState } from "react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (data: AuthData) => {
    setError(null);
    setSuccess(null);
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      login(result.token, result.user.id);

      console.log(result);
      setSuccess("Welcome!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occured.");
    }
  };
  return (
    <>
      <div>
        <AuthForm
          title="Welcome Back"
          buttonText="Sign in"
          isRegister={false}
          onSubmit={handleLogin}
          error={error}
          success={success}
        />
      </div>
    </>
  );
}

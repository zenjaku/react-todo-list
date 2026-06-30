import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../components/AuthForm";
import type { AuthData } from "../../type";
import { useState } from "react";

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleRegister = async (data: AuthData) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setSuccess("Welcome!");
      navigate("/login", { replace: true });
      console.log(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occured.");
    }
  };
  return (
    <>
      <div>
        <AuthForm
          title="Create an Account"
          buttonText="Sign up"
          isRegister={true}
          onSubmit={handleRegister}
          error={error}
          success={success}
        />
      </div>
    </>
  );
}

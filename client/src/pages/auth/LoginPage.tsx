import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../components/AuthForm";
import { useAuth } from "../../context/AuthContext";
import type { AuthData } from "../../type";
import { useState } from "react";
import { Notice } from "../../components/Notice";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogin = async (data: AuthData) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${apiUrl}/login`, {
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

  const message = (
    <>
      <p>
        For your security, do not reuse passwords from your bank, email, or other important accounts. Use a simple,
        unique password for this application instead.
      </p>

      <br />
      <p>
        This website is a personal project and is <strong>not</strong> intended for storing sensitive information.
        Please do not save passwords, usernames, bank account details, personal identification numbers, or any other
        confidential information in your todos.
      </p>
    </>
  );
  return (
    <>
      <div className="login-page">
        <Notice title="Warning!!!" message={message} type="warning" />
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

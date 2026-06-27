import { AuthForm } from "../../components/AuthForm";
import type { AuthData } from "../../interface";

export function RegisterPage() {
  const handleRegister = async (data: AuthData) => {
    try {
      const response = await fetch("http://localhost:9000/api/register", {
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

      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div>
        <AuthForm title="Create an Account" buttonText="Sign up" isRegister={true} onSubmit={handleRegister} />
      </div>
    </>
  );
}

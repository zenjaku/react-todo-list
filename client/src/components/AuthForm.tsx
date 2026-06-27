import { useState } from "react";
import type { AuthFormProps } from "../interface";
import { Link } from "react-router-dom";

export function AuthForm({ title, isRegister = false, buttonText, onSubmit, error, success }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ username, email: isRegister ? email : "", password });
  };

  return (
    <>
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{title}</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <input
            type="text"
            placeholder="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
          />

          {isRegister && (
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          )}

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <button type="submit">{buttonText}</button>

          {!isRegister ? (
            <>
              <p>
                Don't have an account yet? Click{" "}
                <Link to="/register" className="click-here">
                  here
                </Link>{" "}
                to sign up.
              </p>
            </>
          ) : (
            <>
              <p>
                Already have an account? Click{" "}
                <Link to="/" className="click-here">
                  here
                </Link>{" "}
                to sign in.
              </p>
            </>
          )}
        </form>
      </div>
    </>
  );
}

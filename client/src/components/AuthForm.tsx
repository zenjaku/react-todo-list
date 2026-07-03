import { useState } from "react";
import type { AuthFormProps } from "../type";
import { Link } from "react-router-dom";

export function AuthForm({ title, isRegister = false, buttonText, onSubmit, error, success, validationErrors }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (isRegister && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    onSubmit({ username, email: isRegister ? email : "", password });
  };

  return (
    <>
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{title}</h2>

          {(localError || error) && <div className="error-message">{localError || error}</div>}
          {validationErrors && validationErrors.length > 0 && (
            <div className="error-message">
              <ul style={{ margin: 0, paddingLeft: "1.2rem", textAlign: "left" }}>
                {validationErrors.map((err, i) => (
                  <li key={i} style={{ color: "inherit", listStyleType: "circle", marginBottom: "0.2rem" }}>{err}</li>
                ))}
              </ul>
            </div>
          )}
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

          {isRegister && (
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
            />
          )}
          <button type="submit" className="submit-btn">{buttonText}</button>

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

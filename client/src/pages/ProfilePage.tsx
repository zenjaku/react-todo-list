import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`${apiUrl}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        return response.json();
      })
      .then((data) => {
        setUsername(data.user.username);
        setEmail(data.user.email);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not retrieve profile information.");
        setLoading(false);
      });
  }, [token, apiUrl]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setSuccess(null);

    const updateData: { username?: string; email?: string; currentPassword?: string; newPassword?: string } = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    if (newPassword) {
      if (!currentPassword) {
        setError("Current password is required to change your password.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New passwords do not match.");
        return;
      }
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    try {
      const response = await fetch(`${apiUrl}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setValidationErrors(result.errors);
          throw new Error("Password requirements not met.");
        }
        throw new Error(result.message || "Failed to update profile.");
      }

      setSuccess("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="notebook-page">
        <h2>Loading Profile...</h2>
        <p>Retrieving your notepad profile details...</p>
      </div>
    );
  }

  return (
    <div className="notebook-page">
      <h2>Your Profile</h2>
      <p>Manage your account settings below. Any fields left blank will remain unchanged.</p>

      {error && <div className="error-message" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '0.85rem' }}>{error}</div>}
      {validationErrors.length > 0 && (
        <div className="error-message" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '0.85rem' }}>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {validationErrors.map((err, i) => (
              <li key={i} style={{ color: "inherit", listStyleType: "circle", marginBottom: "0.2rem" }}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {success && <div className="success-message" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '0.85rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
        <div>
          <label className="view-modal-meta-label">Username</label>
          <input
            type="text"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Username"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label className="view-modal-meta-label">Email Address</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email Address"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label className="view-modal-meta-label">Current Password</label>
          <input
            type="password"
            className="auth-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Required only if changing password"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label className="view-modal-meta-label">New Password</label>
          <input
            type="password"
            className="auth-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label className="view-modal-meta-label">Confirm New Password</label>
          <input
            type="password"
            className="auth-input"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Match new password"
          />
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button type="submit" className="submit-btn" style={{ width: "auto", padding: "0.5rem 1.5rem" }}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

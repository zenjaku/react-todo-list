import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function GuestRoutes() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/todos" replace />;
  }

  return <Outlet />;
}

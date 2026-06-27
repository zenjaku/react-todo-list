import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GuestRoutes } from "./routes/GuestRoutes";
import { GuestLayout } from "./layout/GuestLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AboutPage } from "./pages/AboutPage";
import { HelpPage } from "./pages/HelpPage";
import { ProtectedRoute } from "./routes/ProtectedRoutes";
import { AuthLayout } from "./layout/AuthLayout";
import { Homepage } from "./pages/Homepage";

function App() {
  function PageWrapper() {
    const { token } = useAuth();
    return token ? <AuthLayout /> : <GuestLayout />;
  }
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestRoutes />}>
              <Route element={<GuestLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/" element={<Homepage />} />
              </Route>
            </Route>

            <Route element={<PageWrapper />}>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;

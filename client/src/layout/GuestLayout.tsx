import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { AboutPage } from "../pages/AboutPage";
import { HelpPage } from "../pages/HelpPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

export function GuestLayout() {
  return (
    <>
      <BrowserRouter>
        <div className="container">
          <Navbar /> 
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}


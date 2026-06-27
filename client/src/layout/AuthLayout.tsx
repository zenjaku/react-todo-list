import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FloatingButton } from "./../components/FloatingButton";
import { Navbar } from "./../components/Navbar";
import { Homepage } from "./../pages/Homepage";
import { AboutPage } from "./../pages/AboutPage";
import { HelpPage } from "./../pages/HelpPage";

export function AuthLayout() {
  return (
    <>
      <BrowserRouter>
        <div className="container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>

          {/* Floating Button */}
          <FloatingButton />
        </div>
      </BrowserRouter>
    </>
  );
}
import { Outlet } from "react-router-dom";
import { FloatingButton } from "./../components/FloatingButton";
import { Navbar } from "./../components/Navbar";

export function AuthLayout() {
  return (
    <>
      <div className="container">
        <Navbar />
        <Outlet />
        {/* Floating Button */}
        <FloatingButton />
      </div>
    </>
  );
}

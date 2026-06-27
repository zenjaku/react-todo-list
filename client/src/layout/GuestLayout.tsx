import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function GuestLayout() {
  return (
    <>
      <div className="container">
        <Navbar />
        <Outlet />
      </div>
    </>
  );
}

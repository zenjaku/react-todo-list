import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import navLogo from '../assets/logo.png'

export function Navbar() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="navigation">
        <header>
          <Link to="/">
            <img src={navLogo} alt="" /> Todo List
          </Link>
        </header>
        <nav className="nav-list">
          <ul>
            {token ? (
              <div ref={menuRef} className="dropdown-menu">
                <button className="dropdown-menu-btn" onClick={() => setOpen((prev) => !prev)}>
                  Menu
                </button>
                {open && (
                  <ul className="dropdown">
                    <li>
                      <NavLink to="/">Home</NavLink>
                    </li>
                    <li>
                      <NavLink to="/profile">Profile</NavLink>
                    </li>
                    <li>
                      <NavLink to="/about">About</NavLink>
                    </li>
                    <li>
                      <NavLink to="/help">Help</NavLink>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}

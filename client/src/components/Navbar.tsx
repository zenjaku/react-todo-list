import { Link, NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <>
      <div className="navigation">
        <header>
          <Link to="/">Todo List</Link>
        </header>
        <nav className="nav-list">
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/help">Help</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

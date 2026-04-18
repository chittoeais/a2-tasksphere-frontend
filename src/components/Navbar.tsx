import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/tasks">Task List</Link>
        {isAuthenticated && <Link to="/tasks/create">Create Task</Link>}
      </div>

      <div className="nav-right">
        {!isAuthenticated ? (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}

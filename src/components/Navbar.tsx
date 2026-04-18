import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
    } finally {
      setIsLoggingOut(false);
    }
  }

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
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        )}
      </div>

      {error && <p className="nav-error">{error}</p>}
    </nav>
  );
}
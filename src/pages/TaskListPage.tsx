import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTasks, type Task } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function TaskListPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await listTasks(token);
      setTasks(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load tasks";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (isLoading) {
    return (
      <div className="card">
        <h2>Task List</h2>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row space">
        <h2>Task List</h2>
        <div className="row">
          <button type="button" onClick={loadTasks}>
            Refresh
          </button>
          <Link to="/tasks/create">
            <button type="button">Create Task</button>
          </Link>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {tasks.length === 0 ? (
        <p>No tasks found. Create your first task.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="task">
            <h3>{task.title}</h3>
            <p>{task.description || "No description"}</p>
            <p>Status: {task.status}</p>

            <div className="row">
              <Link to={`/tasks/edit/${task.id}`}>
                <button type="button">Update</button>
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
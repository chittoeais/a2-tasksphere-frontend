import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskListPage from "./TaskListPage";
import { useAuth } from "../auth/AuthContext";
import { deleteTask, listTasks } from "../api";

vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../api", () => ({
  listTasks: vi.fn(),
  deleteTask: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedListTasks = vi.mocked(listTasks);
const mockedDeleteTask = vi.mocked(deleteTask);

function createAuthValue(
  overrides: Partial<ReturnType<typeof useAuth>> = {}
): ReturnType<typeof useAuth> {
  return {
    token: "token-123",
    isAuthenticated: true,
    isAuthLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides
  };
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/tasks"]}>
      <Routes>
        <Route path="/tasks" element={<TaskListPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TaskListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue());
    mockedDeleteTask.mockResolvedValue({ message: "Deleted" });
  });

  it("loads and displays tasks", async () => {
    mockedListTasks.mockResolvedValue([
      {
        id: "task-1",
        title: "Write tests",
        description: "Cover pages",
        status: "To Do",
        owner_email: "user@example.com"
      }
    ]);

    renderPage();

    expect(screen.getByText("Loading tasks...")).toBeTruthy();
    expect(await screen.findByText("Write tests")).toBeTruthy();
    expect(screen.getByText("Cover pages")).toBeTruthy();
    expect(screen.getByText("Status: To Do")).toBeTruthy();
    expect(mockedListTasks).toHaveBeenCalledWith("token-123");
  });

  it("shows empty state when no tasks are returned", async () => {
    mockedListTasks.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText("No tasks found. Create your first task.")).toBeTruthy();
  });

  it("shows errors when loading fails", async () => {
    mockedListTasks.mockRejectedValue(new Error("Failed to fetch tasks"));
    renderPage();

    expect(await screen.findByText("Failed to fetch tasks")).toBeTruthy();
  });

  it("refreshes task list when refresh button is clicked", async () => {
    mockedListTasks.mockResolvedValue([]);
    renderPage();

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalledTimes(2);
    });
  });

  it("deletes a task from the list", async () => {
    mockedListTasks.mockResolvedValue([
      {
        id: "task-1",
        title: "Delete me",
        description: "Temporary task",
        status: "To Do",
        owner_email: "user@example.com"
      },
      {
        id: "task-2",
        title: "Keep me",
        description: "Persistent task",
        status: "In Progress",
        owner_email: "user@example.com"
      }
    ]);

    renderPage();

    expect(await screen.findByText("Delete me")).toBeTruthy();

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedDeleteTask).toHaveBeenCalledWith("token-123", "task-1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Delete me")).toBeNull();
      expect(screen.getByText("Keep me")).toBeTruthy();
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskCreatePage from "./TaskCreatePage";
import { useAuth } from "../auth/AuthContext";
import { createTask } from "../api";

vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../api", () => ({
  createTask: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedCreateTask = vi.mocked(createTask);

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
    <MemoryRouter initialEntries={["/tasks/create"]}>
      <Routes>
        <Route path="/tasks/create" element={<TaskCreatePage />} />
        <Route path="/tasks" element={<div>Tasks page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TaskCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue());
    mockedCreateTask.mockResolvedValue({
      id: "task-1",
      title: "New Task",
      description: "Something",
      status: "To Do",
      owner_email: "user@example.com"
    });
  });

  it("renders the form", () => {
    renderPage();

    expect(screen.getByText("Create Task")).toBeTruthy();
    expect(screen.getByPlaceholderText("Title")).toBeTruthy();
    expect(screen.getByPlaceholderText("Description")).toBeTruthy();
  });

  it("shows title required validation", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Title is required")).toBeTruthy();
  });

  it("creates task and navigates to tasks", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Write tests" }
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Cover all page components" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockedCreateTask).toHaveBeenCalledWith(
        "token-123",
        "Write tests",
        "Cover all page components"
      );
    });
    expect(await screen.findByText("Tasks page")).toBeTruthy();
  });

  it("does not submit when token is missing", async () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ token: null }));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockedCreateTask).not.toHaveBeenCalled();
    });
    expect(screen.getByText("Create Task")).toBeTruthy();
  });
});

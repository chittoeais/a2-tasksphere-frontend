import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskEditPage from "./TaskEditPage";
import { useAuth } from "../auth/AuthContext";
import { listTasks, updateTask } from "../api";

vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../api", () => ({
  listTasks: vi.fn(),
  updateTask: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedListTasks = vi.mocked(listTasks);
const mockedUpdateTask = vi.mocked(updateTask);

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
    <MemoryRouter initialEntries={["/tasks/edit/task-1"]}>
      <Routes>
        <Route path="/tasks/edit/:id" element={<TaskEditPage />} />
        <Route path="/tasks" element={<div>Tasks page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TaskEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue());
    mockedListTasks.mockResolvedValue([
      {
        id: "task-1",
        title: "Existing Task",
        description: "Current description",
        status: "In Progress",
        owner_email: "user@example.com"
      }
    ]);
    mockedUpdateTask.mockResolvedValue({
      id: "task-1",
      title: "Updated Task",
      description: "Updated description",
      status: "Completed",
      owner_email: "user@example.com"
    });
  });

  it("loads task details into the form", async () => {
    renderPage();

    const titleInput = screen.getByPlaceholderText("Title") as HTMLInputElement;
    const descriptionInput = screen.getByPlaceholderText("Description") as HTMLInputElement;
    const statusSelect = screen.getByRole("combobox") as HTMLSelectElement;

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalledWith("token-123");
      expect(titleInput.value).toBe("Existing Task");
      expect(descriptionInput.value).toBe("Current description");
      expect(statusSelect.value).toBe("In Progress");
    });
  });

  it("updates task and navigates back to task list", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalledWith("token-123");
    });

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Updated Task" }
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Updated description" }
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Completed" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(mockedUpdateTask).toHaveBeenCalledWith("token-123", "task-1", {
        title: "Updated Task",
        description: "Updated description",
        status: "Completed"
      });
    });
    expect(await screen.findByText("Tasks page")).toBeTruthy();
  });

  it("shows title required validation", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(await screen.findByText("Title is required")).toBeTruthy();
  });

  it("does not load or update without a token", async () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ token: null }));
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(mockedListTasks).not.toHaveBeenCalled();
      expect(mockedUpdateTask).not.toHaveBeenCalled();
    });
  });
});

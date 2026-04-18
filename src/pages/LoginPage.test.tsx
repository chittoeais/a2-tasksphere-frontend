import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import { useAuth } from "../auth/AuthContext";

vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);

function createAuthValue(
  overrides: Partial<ReturnType<typeof useAuth>> = {}
): ReturnType<typeof useAuth> {
  return {
    token: null,
    isAuthenticated: false,
    isAuthLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides
  };
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tasks" element={<div>Tasks page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue());
  });

  it("renders the login form", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Login" })).toBeTruthy();
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("shows required validation errors", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Email is required")).toBeTruthy();
    expect(await screen.findByText("Password is required")).toBeTruthy();
  });

  it("submits credentials and navigates to tasks on success", async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue(createAuthValue({ login: loginMock }));

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("user@example.com", "password123");
    });
    expect(await screen.findByText("Tasks page")).toBeTruthy();
  });

  it("shows API/login errors", async () => {
    const loginMock = vi.fn().mockRejectedValue(new Error("Invalid credentials"));
    mockedUseAuth.mockReturnValue(createAuthValue({ login: loginMock }));

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrong-password" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeTruthy();
  });

  it("redirects authenticated users", async () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ isAuthenticated: true }));

    renderPage();

    expect(await screen.findByText("Tasks page")).toBeTruthy();
  });
});

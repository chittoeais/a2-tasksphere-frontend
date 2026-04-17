import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";
import { useAuth } from "../auth/AuthContext";
import { registerUser } from "../api";

vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../api", () => ({
  registerUser: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedRegisterUser = vi.mocked(registerUser);

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
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/tasks" element={<div>Tasks page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue(createAuthValue());
    mockedRegisterUser.mockResolvedValue({ message: "User created" });
  });

  it("renders the register form", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Register" })).toBeTruthy();
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Register" })).toBeTruthy();
  });

  it("shows password length validation", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "short" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Password must be at least 8 characters")).toBeTruthy();
  });

  it("registers and navigates to login on success", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockedRegisterUser).toHaveBeenCalledWith("user@example.com", "password123");
    });
    expect(await screen.findByText("Login page")).toBeTruthy();
  });

  it("shows registration errors from API", async () => {
    mockedRegisterUser.mockRejectedValue(new Error("User already exists"));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("User already exists")).toBeTruthy();
  });

  it("redirects authenticated users to tasks", async () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ isAuthenticated: true }));

    renderPage();

    expect(await screen.findByText("Tasks page")).toBeTruthy();
  });
});

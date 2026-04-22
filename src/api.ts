import { useAuth } from "./auth/AuthContext";

const API_URL = (import.meta.env.VITE_API_URL || window.API_URL || "http://localhost:8000").replace(/\/$/, "");

export type TaskStatus = "To Do" | "In Progress" | "Completed";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  owner_email: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

type MessageResponse = {
  message: string;
};

type UpdateTaskPayload = Partial<Pick<Task, "title" | "description" | "status">>;

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail
          .map((item: { msg?: string; ctx?: { reason?: string } }) => item.msg || item.ctx?.reason)
          .filter(Boolean)
          .join(", ");
      } else if (typeof data.detail === "string") {
        message = data.detail;
      } else {
        message = data.message || JSON.stringify(data);
      }

    } catch {
      message = await response.text();
    }
    throw new Error(message || "Request failed");
  }

  return response.json();
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function registerUser(email: string, password: string): Promise<MessageResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return parseResponse<MessageResponse>(response);
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return parseResponse<LoginResponse>(response);
}

export async function logoutUser(): Promise<MessageResponse> {
  const { token } = useAuth();
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseResponse<MessageResponse>(response);
}

export async function listTasks(token: string): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseResponse<Task[]>(response);
}

export async function createTask(token: string, title: string, description: string): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title, description })
  });

  return parseResponse<Task>(response);
}

export async function updateTask(token: string, id: string, data: UpdateTaskPayload): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data)
  });

  return parseResponse<Task>(response);
}

export async function deleteTask(token: string, id: string): Promise<MessageResponse> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseResponse<MessageResponse>(response);
}

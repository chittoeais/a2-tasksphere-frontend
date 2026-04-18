import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "../auth/AuthContext";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError("");
    try {
      await login(data.email, data.password);
      navigate("/tasks");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        {...register("email", {
          required: "Email is required"
        })}
      />
      {errors.email && <p className="error-text">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Password"
        {...register("password", {
          required: "Password is required"
        })}
      />
      {errors.password && <p className="error-text">{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
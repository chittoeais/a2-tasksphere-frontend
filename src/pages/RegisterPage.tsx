import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { registerUser } from "../api";
import { useAuth } from "../auth/AuthContext";

type RegisterFormInputs = {
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setError("");
    try {
      await registerUser(data.email, data.password);
      navigate("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Register</h2>

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
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters"
          }
        })}
      />
      {errors.password && <p className="error-text">{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </button>

      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
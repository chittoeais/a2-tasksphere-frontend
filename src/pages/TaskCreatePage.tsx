import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createTask } from "../api";
import { useAuth } from "../auth/AuthContext";

type TaskCreateFormInputs = {
  title: string;
  description: string;
};

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TaskCreateFormInputs>({
    defaultValues: {
      title: "",
      description: ""
    }
  });

  const onSubmit: SubmitHandler<TaskCreateFormInputs> = async (data) => {
    if (!token) return;
    await createTask(token, data.title, data.description);
    navigate("/tasks");
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Create Task</h2>

      <input
        placeholder="Title"
        {...register("title", {
          required: "Title is required"
        })}
      />
      {errors.title && <p className="error-text">{errors.title.message}</p>}

      <input placeholder="Description" {...register("description")} />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
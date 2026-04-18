import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { listTasks, updateTask, type TaskStatus } from "../api";
import { useAuth } from "../auth/AuthContext";

type TaskEditFormInputs = {
  title: string;
  description: string;
  status: TaskStatus;
};

export default function TaskEditPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskEditFormInputs>({
    defaultValues: {
      title: "",
      description: "",
      status: "To Do"
    }
  });

  useEffect(() => {
    async function loadTask() {
      if (!token || !id) return;

      const tasks = await listTasks(token);
      const task = tasks.find((t) => t.id === id);

      if (task) {
        reset({
          title: task.title,
          description: task.description || "",
          status: task.status as TaskStatus
        });
      }
    }

    loadTask();
  }, [id, token, reset]);

  const onSubmit: SubmitHandler<TaskEditFormInputs> = async (data) => {
    if (!token || !id) return;
    await updateTask(token, id, data);
    navigate("/tasks");
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Update Task</h2>

      <input
        placeholder="Title"
        {...register("title", {
          required: "Title is required"
        })}
      />
      {errors.title && <p className="error-text">{errors.title.message}</p>}

      <input placeholder="Description" {...register("description")} />

      <select {...register("status")}>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
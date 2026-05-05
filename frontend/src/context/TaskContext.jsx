import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { setUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks", { params });
      setTasks(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (payload) => {
    const { data } = await api.post("/tasks", payload);
    setTasks((current) =>
      [...current, data].sort((a, b) =>
        `${a.taskDate}${a.startTime || ""}`.localeCompare(`${b.taskDate}${b.startTime || ""}`)
      )
    );
    toast.success("Task added");
    return data;
  };

  const completeTask = async (id) => {
    const { data } = await api.patch(`/tasks/${id}/complete`);
    setTasks((current) => current.map((task) => (task._id === id ? data.task : task)));
    setUser((current) =>
      current
        ? { ...current, achievementScore: data.achievementScore, streak: data.streak }
        : current
    );
    toast.success("+5 achievement points earned");
    return data;
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((current) => current.filter((task) => task._id !== id));
    toast.success("Task deleted");
  };

  const value = useMemo(
    () => ({ tasks, loading, fetchTasks, createTask, completeTask, deleteTask }),
    [tasks, loading]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);

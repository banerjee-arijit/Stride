import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import api from "../api/client";
import { useAuth } from "./AuthContext";
import {
  cacheTasks,
  enqueueAction,
  filterTasks,
  getCachedTasks,
  getQueuedActions,
  removeQueuedAction
} from "../lib/offlineStore";

const TaskContext = createContext(null);

const sortTasks = (tasks) =>
  [...tasks].sort((a, b) =>
    `${a.taskDate}${a.startTime || ""}`.localeCompare(`${b.taskDate}${b.startTime || ""}`)
  );

const mergeTasks = (currentTasks, incomingTasks) => {
  const tasksById = new Map(currentTasks.map((task) => [task._id, task]));
  incomingTasks.forEach((task) => tasksById.set(task._id, task));
  return sortTasks([...tasksById.values()]);
};

const isNetworkError = (error) => !navigator.onLine || !error.response;

export function TaskProvider({ children }) {
  const { user, setUser, refreshProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const lastParamsRef = useRef({});
  const syncingRef = useRef(false);
  const userId = user?.id || user?._id;

  const updateCachedTasks = async (updater) => {
    const cachedTasks = await getCachedTasks(userId);
    const nextTasks = sortTasks(updater(cachedTasks));
    await cacheTasks(userId, nextTasks);
    return nextTasks;
  };

  const updateUserProgress = (progress) => {
    setUser((current) => {
      if (!current) return current;

      const nextUser = {
        ...current,
        achievementScore: progress.achievementScore,
        achievementReward: progress.achievementReward,
        streak: progress.streak
      };

      localStorage.setItem("task_tracker_user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const fetchTasks = async (params = {}) => {
    lastParamsRef.current = params;
    setLoading(true);
    try {
      const { data } = await api.get("/tasks", { params });
      setTasks(data);
      const cachedTasks = await getCachedTasks(userId);
      await cacheTasks(userId, mergeTasks(cachedTasks, data));
      return data;
    } catch (error) {
      const cachedTasks = await getCachedTasks(userId);
      const visibleTasks = filterTasks(cachedTasks, params);

      if (visibleTasks.length || isNetworkError(error)) {
        setTasks(visibleTasks);
        return visibleTasks;
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (payload) => {
    try {
      const { data } = await api.post("/tasks", payload);
      setTasks((current) => sortTasks([...current, data]));
      await updateCachedTasks((current) => mergeTasks(current, [data]));
      toast.success("Task added");
      return data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;

      const offlineTask = {
        ...payload,
        _id: `offline-${Date.now()}`,
        completed: false,
        completedAt: null,
        offline: true,
        pendingSync: true,
        createdAt: new Date().toISOString()
      };

      setTasks((current) => sortTasks([...current, offlineTask]));
      await updateCachedTasks((current) => mergeTasks(current, [offlineTask]));
      await enqueueAction(userId, { type: "createTask", payload, localId: offlineTask._id });
      toast.success("Task saved offline. It will sync when you are online.");
      return offlineTask;
    }
  };

  const completeTask = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/complete`);
      setTasks((current) => current.map((task) => (task._id === id ? data.task : task)));
      await updateCachedTasks((current) => current.map((task) => (task._id === id ? data.task : task)));
      updateUserProgress(data);

      if (data.scoreReset) {
        toast.success("You hit 100 Rewards. The cycle reset to 0 and your pledge unlocked again.");
      } else if (data.goalReached) {
        toast.success("You hit your 100 Rewards cycle.");
      } else {
        toast.success("+5 Rewards earned");
      }
      return data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;

      const completedAt = new Date().toISOString();
      const offlineUpdate = (task) =>
        task._id === id ? { ...task, completed: true, completedAt, pendingSync: true } : task;

      setTasks((current) => current.map(offlineUpdate));
      await updateCachedTasks((current) => current.map(offlineUpdate));
      await enqueueAction(userId, { type: "completeTask", taskId: id });
      toast.success("Completion saved offline. Rewards will sync when you are online.");
      return { offline: true };
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task._id !== id));
      await updateCachedTasks((current) => current.filter((task) => task._id !== id));
      toast.success("Task deleted");
    } catch (error) {
      if (!isNetworkError(error)) throw error;

      setTasks((current) => current.filter((task) => task._id !== id));
      await updateCachedTasks((current) => current.filter((task) => task._id !== id));
      await enqueueAction(userId, { type: "deleteTask", taskId: id });
      toast.success("Delete saved offline. It will sync when you are online.");
    }
  };

  const syncQueuedActions = async () => {
    if (!navigator.onLine || !userId || syncingRef.current) return;

    syncingRef.current = true;
    setSyncing(true);
    const localIdMap = new Map();

    try {
      const queuedActions = await getQueuedActions(userId);
      if (!queuedActions.length) return;

      for (const action of queuedActions) {
        if (action.type === "createTask") {
          const { data } = await api.post("/tasks", action.payload);
          localIdMap.set(action.localId, data._id);
          setTasks((current) => current.map((task) => (task._id === action.localId ? data : task)));
          await updateCachedTasks((current) =>
            current.map((task) => (task._id === action.localId ? data : task))
          );
        }

        if (action.type === "completeTask") {
          const taskId = localIdMap.get(action.taskId) || action.taskId;
          if (!String(taskId).startsWith("offline-")) {
            const { data } = await api.patch(`/tasks/${taskId}/complete`);
            setTasks((current) => current.map((task) => (task._id === taskId ? data.task : task)));
            await updateCachedTasks((current) =>
              current.map((task) => (task._id === taskId ? data.task : task))
            );
            updateUserProgress(data);
          }
        }

        if (action.type === "deleteTask") {
          const taskId = localIdMap.get(action.taskId) || action.taskId;
          if (!String(taskId).startsWith("offline-")) {
            await api.delete(`/tasks/${taskId}`);
          }
        }

        await removeQueuedAction(action.id);
      }

      await fetchTasks(lastParamsRef.current);
      await refreshProfile().catch(() => {});
      toast.success("Offline changes synced");
    } catch (_error) {
      toast.error("Some offline changes could not sync yet");
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!userId) return undefined;

    const handleOnline = () => syncQueuedActions();

    if (navigator.onLine) {
      syncQueuedActions();
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [userId]);

  const value = useMemo(
    () => ({ tasks, loading, syncing, fetchTasks, createTask, completeTask, deleteTask, syncQueuedActions }),
    [tasks, loading, syncing, userId]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("task_tracker_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistSession = ({ token, user: authUser }) => {
    localStorage.setItem("task_tracker_token", token);
    localStorage.setItem("task_tracker_user", JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      const authUser = persistSession(data);
      toast.success("Account created");
      navigate(authUser.avatar ? "/" : "/choose-avatar");
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", payload);
      const authUser = persistSession(data);
      toast.success("Signed in");
      navigate(authUser.avatar ? "/" : "/choose-avatar");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("task_tracker_token");
    localStorage.removeItem("task_tracker_user");
    setUser(null);
    navigate("/login");
  };

  const refreshProfile = async () => {
    const { data } = await api.get("/users/profile");
    localStorage.setItem("task_tracker_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const updateAvatar = async (avatar) => {
    const { data } = await api.patch("/users/profile/avatar", { avatar });
    localStorage.setItem("task_tracker_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    if (user) refreshProfile().catch(() => logout());
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, register, login, logout, refreshProfile, updateAvatar }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

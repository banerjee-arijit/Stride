import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/client";
import { cacheProfile, getCachedProfile } from "../lib/offlineStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("task_tracker_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const clearSession = () => {
    localStorage.removeItem("task_tracker_token");
    localStorage.removeItem("task_tracker_user");
    setUser(null);
  };

  const cacheUserSnapshot = async (authUser, data = {}) => {
    const userId = authUser.id || authUser._id;
    const cachedProfile = await getCachedProfile(userId);
    cacheProfile(userId, { ...cachedProfile, ...data, user: authUser }).catch(() => {});
  };

  const persistSession = ({ token, user: authUser }) => {
    localStorage.setItem("task_tracker_token", token);
    localStorage.setItem("task_tracker_user", JSON.stringify(authUser));
    setUser(authUser);
    cacheUserSnapshot(authUser).catch(() => {});
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
    clearSession();
    navigate("/login");
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get("/users/profile");
      localStorage.setItem("task_tracker_user", JSON.stringify(data.user));
      setUser(data.user);
      cacheProfile(data.user.id || data.user._id, data).catch(() => {});
      return data;
    } catch (error) {
      const cachedProfile = await getCachedProfile(user?.id || user?._id);

      if (cachedProfile) {
        localStorage.setItem("task_tracker_user", JSON.stringify(cachedProfile.user));
        setUser(cachedProfile.user);
        return cachedProfile;
      }

      throw error;
    }
  };

  const updateAvatar = async (avatar) => {
    const { data } = await api.patch("/users/profile/avatar", { avatar });
    localStorage.setItem("task_tracker_user", JSON.stringify(data.user));
    setUser(data.user);
    await cacheUserSnapshot(data.user);
    return data.user;
  };

  const updateAchievementReward = async (achievementReward) => {
    const { data } = await api.patch("/users/profile/reward", { achievementReward });
    localStorage.setItem("task_tracker_user", JSON.stringify(data.user));
    setUser(data.user);
    await cacheUserSnapshot(data.user);
    return data.user;
  };

  const deleteAccount = async (payload) => {
    setLoading(true);
    try {
      await api.delete("/users/profile", { data: payload });
      clearSession();
      toast.success("Account deleted");
      navigate("/signing-off", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProfile().catch(() => {
        if (navigator.onLine) {
          clearSession();
          navigate("/login");
        }
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      register,
      login,
      logout,
      refreshProfile,
      updateAvatar,
      updateAchievementReward,
      deleteAccount
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

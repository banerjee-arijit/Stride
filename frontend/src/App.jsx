import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import { TaskProvider } from "./context/TaskContext";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./features/auth/AuthPage";
import AvatarSelectionPage from "./pages/AvatarSelectionPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SigningOffPage from "./pages/SigningOffPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TasksPage from "./pages/TasksPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

function AvatarRequired({ children }) {
  const { user } = useAuth();
  return user?.avatar ? children : <Navigate to="/choose-avatar" replace />;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("task_tracker_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("task_tracker_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/signing-off" element={<SigningOffPage />} />
        <Route
          path="/choose-avatar"
          element={
            <ProtectedRoute>
              <AvatarSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AvatarRequired>
                <TaskProvider>
                  <AppLayout darkMode={darkMode} setDarkMode={setDarkMode} />
                </TaskProvider>
              </AvatarRequired>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

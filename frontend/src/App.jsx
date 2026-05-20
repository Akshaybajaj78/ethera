import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { useAuth } from "./state/AuthContext.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ProjectsPage } from "./pages/ProjectsPage.jsx";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage.jsx";
import { TasksPage } from "./pages/TasksPage.jsx";
import { Toasts } from "./components/Toasts.jsx";

export default function App() {
  const { token } = useAuth();

  return (
    <div className="min-h-full">
      <div className="bg-aurora fixed inset-0 -z-10 opacity-70 dark:opacity-60" />
      <Navbar />
      <Toasts />
      <div className="py-6">
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

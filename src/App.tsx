import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Home from "@/pages/Home";
import Notes from "@/pages/Notes";
import Diary from "@/pages/Diary";
import Graph from "@/pages/Graph";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#030305]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#2DD4BF] flex items-center justify-center animate-pulse">
            <span className="text-white font-display font-bold text-lg">L</span>
          </div>
          <p className="text-sm text-[#8B8B96]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

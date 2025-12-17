import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ForecastPage from "./pages/ForecastPage";
import ChatbotPage from "./pages/ChatbotPage";
import ReportsPage from "./pages/ReportsPage";
import DataManagementPage from "./pages/DataManagementPage";
import ScheduleManagementPage from "./pages/ScheduleManagementPage";
import NoticeManagementPage from "./pages/NoticeManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/layout/MainLayout";
import { ScrollToTop } from "./components/layout/ScrollToTop";
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 테스트를 위해 인증 검사 임시 비활성화
  // const { isAuthenticated } = useAuth();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/data" element={<DataManagementPage />} />
        <Route path="/admin/schedule" element={<ScheduleManagementPage />} />
        <Route path="/admin/notice" element={<NoticeManagementPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/settings" element={<SystemSettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

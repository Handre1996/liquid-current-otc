import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import KycPage from "./pages/KycPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import TradingDashboardPage from "./pages/TradingDashboardPage";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthRouter from "./components/AuthRouter";
import WhatsAppChat from "./components/WhatsAppChat";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AuthRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/kyc" element={<KycPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<TradingDashboardPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthRouter>
            <WhatsAppChat />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
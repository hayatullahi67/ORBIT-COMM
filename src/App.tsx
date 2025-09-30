import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import MyNumbers from "./pages/dashboard/MyNumbers";
import MyESIMs from "./pages/dashboard/MyESIMs";
import Rentals from "./pages/dashboard/Rentals";
// import BuyESIM from "./pages/dashboard/BuyESIM";
import Transactions from "./pages/dashboard/Transactions";
import APIAccess from "./pages/dashboard/APIAccess";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/index" element={<Landing />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Auth Routes */}
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/login" element={<Login />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/numbers" element={<ProtectedRoute><MyNumbers /></ProtectedRoute>} />
            <Route path="/dashboard/esims" element={<ProtectedRoute><MyESIMs /></ProtectedRoute>} />
            <Route path="/dashboard/rentals" element={<ProtectedRoute><Rentals /></ProtectedRoute>} />
            {/* <Route path="/dashboard/buy-esim" element={<ProtectedRoute><BuyESIM /></ProtectedRoute>} /> */}
            <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/dashboard/api" element={<ProtectedRoute><APIAccess /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Static Pages */}
            <Route path="/about" element={<NotFound />} />
            <Route path="/contact" element={<NotFound />} />
            <Route path="/faq" element={<NotFound />} />
            <Route path="/api-docs" element={<NotFound />} />
            <Route path="/affiliate" element={<NotFound />} />
            <Route path="/privacy" element={<NotFound />} />
            <Route path="/terms" element={<NotFound />} />
            <Route path="/status" element={<NotFound />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

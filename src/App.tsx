import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Pages
import Landing from "./pages/Landing";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import MyNumbers from "./pages/dashboard/MyNumbers";
import MyESIMs from "./pages/dashboard/MyESIMs";
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
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/numbers" element={<MyNumbers />} />
          <Route path="/dashboard/esims" element={<MyESIMs />} />
          {/* <Route path="/dashboard/buy-esim" element={<BuyESIM />} /> */}
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/api" element={<APIAccess />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          
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

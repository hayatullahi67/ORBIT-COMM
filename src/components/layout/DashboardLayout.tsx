import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Home,
  Smartphone,
  Globe,
  CreditCard,
  Code,
  Settings,
  LogOut,
  User,
  Menu,
  LogIn,
  X,
  Bell,
  Wallet
} from "lucide-react"
import { useTheme } from "next-themes"


interface DashboardLayoutProps {
  children: React.ReactNode
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation()
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth/login");
        return;
      }

      try {
        const response = await fetch("https://comiun.onrender.com/api/auth/current_user", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user data, logging out.");
          // Token might be invalid or expired, clear it and redirect to login
          localStorage.removeItem("token");
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Numbers", href: "/dashboard/numbers", icon: Smartphone },
    { name: "My eSIMs", href: "/dashboard/esims", icon: Globe },
    { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    { name: "API Access", href: "/dashboard/api", icon: Code },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    setSidebarOpen(false);
    const token = localStorage.getItem("token");

    // If no token exists, just redirect to login
    if (!token) {
      navigate("/auth/login");
      return;
    }

    try {
      const response = await fetch("https://comiun.onrender.com/api/auth/logout", {
        method: "POST", // Using POST is a common practice for logout
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Log an error if the server-side logout fails, but proceed with client-side logout
        console.error("Server logout failed:", response.status);
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Always remove the token and redirect to login, regardless of server response
      localStorage.removeItem("token");
      navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card/50 backdrop-blur-xl border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Smartphone className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-space font-bold bg-gradient-primary bg-clip-text text-transparent">
                VirtualSIM
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <Separator />

          {/* User section */}
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="/placeholder-avatar.png" alt={user ? `${user.firstName} ${user.lastName}` : 'User'} />
                    <AvatarFallback>
                      {user && user.firstName && user.lastName
                        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user ? user.email : "..."}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/transactions">
                    <Wallet className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
              onClick={handleLogout}>
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
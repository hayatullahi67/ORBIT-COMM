import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { loginUser, createAccount, isValidEmail } from "@/lib/auth"
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { email: string }) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate inputs
    const newErrors: { email?: string; password?: string; confirmPassword?: string; general?: string } = {}
    
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email"
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    if (mode === 'signup') {
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      let user;
      
      if (mode === 'login') {
        user = loginUser(email.trim(), password)
      } else {
        user = createAccount(email.trim(), password)
      }
      
      onLogin(user)
      onClose()
      
      // Reset form
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setErrors({})
      setMode('login')
    } catch (error) {
      console.error(`${mode} error:`, error)
      if (mode === 'login') {
        setErrors({ 
          general: error instanceof Error ? error.message : "Login failed. Please try again." 
        })
      } else {
        setErrors({ 
          general: error instanceof Error ? error.message : "Account creation failed. Please try again." 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setErrors({})
  }

  const switchMode = () => {
    resetForm()
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'login' ? (
              <>
                <User className="h-5 w-5" />
                Welcome Back
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? "Sign in to access your Paystack wallet and services"
              : "Create a new account with Paystack wallet to get started"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{errors.general}</p>
              {mode === 'login' && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={switchMode}
                  className="text-destructive hover:text-destructive/80 p-0 h-auto mt-1"
                >
                  Create a new account instead
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="glass"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                mode === 'login' ? "Signing In..." : "Creating Account..."
              ) : (
                mode === 'login' ? "Sign In" : "Create Account"
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={switchMode}
              className="p-0 h-auto text-primary hover:text-primary/80"
              disabled={isLoading}
            >
              {mode === 'login' ? "Create one here" : "Sign in here"}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginModal
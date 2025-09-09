import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { 
  Wallet, 
  Plus, 
  MessageSquare, 
  Smartphone, 
  Globe,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const Dashboard = () => {
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("https://api.tiger-sms.com/stubs/handler_api.php?api_key=VfFeLex22JhqGaCEfeJnhn4vwRpjdMTv&action=getBalance")
        const text = await res.text()
        // The API returns something like: ACCESS_BALANCE:45.67
        const match = text.match(/ACCESS_BALANCE:(\d+(\.\d+)?)/)
        if (match) {
          setBalance(parseFloat(match[1]))
        }
      } catch (e) {
        // Optionally handle error, but keep UI unaffected
      }
    }
    fetchBalance()
  }, [])

  const recentMessages = [
    {
      id: 1,
      number: "+1 (555) 123-4567",
      service: "WhatsApp",
      message: "Your verification code is: 123456",
      time: "2 minutes ago",
      status: "received"
    },
    {
      id: 2,
      number: "+44 7700 900123",
      service: "Telegram",
      message: "Welcome to Telegram! Your code: 789012",
      time: "15 minutes ago",
      status: "received"
    },
    {
      id: 3,
      number: "+33 6 12 34 56 78",
      service: "Google",
      message: "Your Google verification code is 345678",
      time: "1 hour ago",
      status: "received"
    }
  ]

  const activeRentals = [
    {
      id: 1,
      number: "+1 (555) 987-6543",
      country: "United States",
      expires: "in 28 days",
      status: "active"
    },
    {
      id: 2,
      number: "+44 7700 900456",
      country: "United Kingdom", 
      expires: "in 12 days",
      status: "active"
    }
  ]

  const esimActivations = [
    {
      id: 1,
      plan: "Europe 30-Day",
      data: "10GB",
      expires: "in 15 days",
      status: "active"
    },
    {
      id: 2,
      plan: "Global Traveler",
      data: "5GB",
      expires: "in 3 days",
      status: "expiring"
    }
  ]

  const stats = [
    {
      title: "Wallet Balance",
      value: `$${balance.toFixed(2)}`,
      icon: Wallet,
      color: "text-success"
    },
    {
      title: "Messages Today",
      value: "12",
      icon: MessageSquare,
      color: "text-primary"
    },
    {
      title: "Active Numbers",
      value: "3",
      icon: Smartphone,
      color: "text-secondary"
    },
    {
      title: "eSIMs Active",
      value: "2",
      icon: Globe,
      color: "text-accent"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-space font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your account overview.</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/pricing">
              <Plus className="h-4 w-4 mr-2" />
              Buy Number
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Section */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-success" />
                  Wallet
                </CardTitle>
                <CardDescription>Manage your account balance</CardDescription>
              </div>
              <Button variant="neon" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-success">${balance.toFixed(2)}</div>
              <p className="text-muted-foreground text-sm mb-4">Available Balance</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last deposit</span>
                  <span className="text-success">+$50.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This month usage</span>
                  <span>$24.33</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="glass" className="w-full justify-start" asChild>
                <Link to="/pricing">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Rent Virtual Number
                </Link>
              </Button>
              <Button variant="glass" className="w-full justify-start" asChild>
                <Link to="/pricing">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Verification
                </Link>
              </Button>
              <Button variant="glass" className="w-full justify-start" asChild>
                <Link to="/pricing">
                  <Globe className="h-4 w-4 mr-2" />
                  Buy eSIM Plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent SMS Messages */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent SMS Messages
              </CardTitle>
              <CardDescription>Latest verification codes and messages</CardDescription>
            </div>
            <Button variant="minimal" asChild>
              <Link to="/dashboard/messages">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <div key={message.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {message.service}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{message.number}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  </div>
                  {index < recentMessages.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Rentals */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-secondary" />
                  Active Rentals
                </CardTitle>
                <CardDescription>Your rental numbers</CardDescription>
              </div>
              <Button variant="minimal" asChild>
                <Link to="/dashboard/numbers">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeRentals.map((rental) => (
                  <div key={rental.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{rental.number}</p>
                      <p className="text-sm text-muted-foreground">{rental.country}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Active</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{rental.expires}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* eSIM Activations */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" />
                  eSIM Plans
                </CardTitle>
                <CardDescription>Your active eSIM subscriptions</CardDescription>
              </div>
              <Button variant="minimal" asChild>
                <Link to="/dashboard/esims">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {esimActivations.map((esim) => (
                  <div key={esim.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{esim.plan}</p>
                      <p className="text-sm text-muted-foreground">{esim.data} data</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={esim.status === 'expiring' ? 'destructive' : 'secondary'}>
                        {esim.status === 'expiring' ? (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expiring
                          </>
                        ) : (
                          'Active'
                        )}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{esim.expires}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
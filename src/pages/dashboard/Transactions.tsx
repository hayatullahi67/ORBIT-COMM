import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { 
  CreditCard, 
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  Filter,
  Search
} from "lucide-react"

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const transactions = [
    {
      id: "txn_001",
      type: "debit",
      amount: 15.99,
      description: "Virtual Number Rental - US +1 (555) 123-4567",
      service: "Number Rental",
      date: "2024-10-01T10:30:00Z",
      status: "completed",
      paymentMethod: "Credit Card"
    },
    {
      id: "txn_002", 
      type: "credit",
      amount: 50.00,
      description: "Wallet Top-up",
      service: "Wallet",
      date: "2024-09-28T14:15:00Z",
      status: "completed",
      paymentMethod: "Bank Transfer"
    },
    {
      id: "txn_003",
      type: "debit",
      amount: 29.99,
      description: "eSIM Plan - Europe 30-Day Premium",
      service: "eSIM",
      date: "2024-09-25T09:45:00Z",
      status: "completed",
      paymentMethod: "Credit Card"
    },
    {
      id: "txn_004",
      type: "debit",
      amount: 0.50,
      description: "SMS Verification - WhatsApp",
      service: "SMS Verification",
      date: "2024-09-24T16:20:00Z",
      status: "completed",
      paymentMethod: "Wallet Balance"
    },
    {
      id: "txn_005",
      type: "debit",
      amount: 12.99,
      description: "Virtual Number Rental - UK +44 7700 900123",
      service: "Number Rental",
      date: "2024-09-20T11:10:00Z",
      status: "completed",
      paymentMethod: "PayPal"
    },
    {
      id: "txn_006",
      type: "credit",
      amount: 5.00,
      description: "Referral Bonus - Friend Signup",
      service: "Referral",
      date: "2024-09-18T13:30:00Z",
      status: "completed",
      paymentMethod: "Bonus Credit"
    },
    {
      id: "txn_007",
      type: "debit",
      amount: 0.25,
      description: "SMS Verification - Telegram",
      service: "SMS Verification",
      date: "2024-09-15T08:45:00Z",
      status: "completed",
      paymentMethod: "Wallet Balance"
    },
    {
      id: "txn_008",
      type: "debit",
      amount: 39.99,
      description: "eSIM Plan - Global Unlimited",
      service: "eSIM",
      date: "2024-09-10T19:20:00Z",
      status: "failed",
      paymentMethod: "Credit Card"
    }
  ]

  const stats = [
    {
      title: "Total Spent",
      value: "$154.72",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: DollarSign
    },
    {
      title: "This Month",
      value: "$45.99",
      change: "-8.2%", 
      changeType: "decrease" as const,
      icon: Calendar
    },
    {
      title: "Transactions",
      value: "28",
      change: "+3",
      changeType: "increase" as const,
      icon: CreditCard
    },
    {
      title: "Avg. per Transaction",
      value: "$5.52",
      change: "+1.1%",
      changeType: "increase" as const,
      icon: ArrowUpRight
    }
  ]

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      selectedFilter === "all" ||
      (selectedFilter === "credit" && transaction.type === "credit") ||
      (selectedFilter === "debit" && transaction.type === "debit") ||
      (selectedFilter === "failed" && transaction.status === "failed")
    
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground"
      case "failed":
        return "bg-destructive text-destructive-foreground"
      case "pending":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getServiceColor = (service: string) => {
    switch (service) {
      case "Number Rental":
        return "bg-primary text-primary-foreground"
      case "eSIM":
        return "bg-accent text-accent-foreground"
      case "SMS Verification":
        return "bg-secondary text-secondary-foreground"
      case "Wallet":
        return "bg-success text-success-foreground"
      case "Referral":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-space font-bold">Transactions</h1>
            <p className="text-muted-foreground">View your transaction history and manage billing</p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </div>

        {/* Stats */}
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
                      <p className={`text-sm ${
                        stat.changeType === "increase" ? "text-success" : "text-destructive"
                      }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Transactions</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by description or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedFilter === "all" ? "hero" : "glass"}
                  onClick={() => setSelectedFilter("all")}
                >
                  All
                </Button>
                <Button 
                  variant={selectedFilter === "credit" ? "hero" : "glass"}
                  onClick={() => setSelectedFilter("credit")}
                >
                  Credits
                </Button>
                <Button 
                  variant={selectedFilter === "debit" ? "hero" : "glass"}
                  onClick={() => setSelectedFilter("debit")}
                >
                  Debits
                </Button>
                <Button 
                  variant={selectedFilter === "failed" ? "hero" : "glass"}
                  onClick={() => setSelectedFilter("failed")}
                >
                  Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transactions found
              </CardDescription>
            </div>
            <Button variant="glass">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "credit" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
                    }`}>
                      {transaction.type === "credit" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getServiceColor(transaction.service)}>
                          {transaction.service}
                        </Badge>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === "credit" ? "text-success" : "text-foreground"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Your transactions will appear here once you start using our services"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Transactions
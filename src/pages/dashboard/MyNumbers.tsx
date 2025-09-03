import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { 
  Smartphone, 
  Plus, 
  Calendar,
  MapPin,
  MoreVertical,
  Copy,
  RefreshCw,
  Trash2,
  MessageSquare
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MyNumbers = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const numbers = [
    {
      id: 1,
      number: "+1 (555) 123-4567",
      country: "United States",
      countryCode: "US",
      type: "Rental",
      status: "Active",
      expires: "2024-11-15",
      messagesCount: 12,
      lastUsed: "2 hours ago",
      services: ["WhatsApp", "Telegram", "Google"]
    },
    {
      id: 2,
      number: "+44 7700 900123",
      country: "United Kingdom", 
      countryCode: "UK",
      type: "Rental",
      status: "Active",
      expires: "2024-10-28",
      messagesCount: 8,
      lastUsed: "1 day ago",
      services: ["Instagram", "Twitter"]
    },
    {
      id: 3,
      number: "+33 6 12 34 56 78",
      country: "France",
      countryCode: "FR", 
      type: "Temporary",
      status: "Expired",
      expires: "2024-09-20",
      messagesCount: 3,
      lastUsed: "2 weeks ago",
      services: ["Discord"]
    },
    {
      id: 4,
      number: "+49 151 12345678",
      country: "Germany",
      countryCode: "DE",
      type: "Rental", 
      status: "Active",
      expires: "2024-12-01",
      messagesCount: 25,
      lastUsed: "5 minutes ago",
      services: ["WhatsApp", "Signal", "Viber", "Telegram"]
    }
  ]

  const filteredNumbers = numbers.filter(number => 
    number.number.includes(searchTerm) || 
    number.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground"
      case "Expired":
        return "bg-destructive text-destructive-foreground"
      case "Expiring":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Rental":
        return "bg-primary text-primary-foreground"
      case "Temporary":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-space font-bold">My Numbers</h1>
            <p className="text-muted-foreground">Manage your virtual numbers and rental subscriptions</p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Get New Number
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Numbers</Label>
                <Input
                  id="search"
                  placeholder="Search by number or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="glass">All Types</Button>
                <Button variant="glass">Active Only</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Numbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNumbers.map((number) => (
            <Card key={number.id} className="glass hover:shadow-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <Badge className={getTypeColor(number.type)}>
                    {number.type}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Number
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="text-lg font-mono font-bold">{number.number}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {number.country}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(number.status)}>
                    {number.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {number.messagesCount} messages
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(number.expires).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last used:</span>
                    <span>{number.lastUsed}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Services Used:</div>
                  <div className="flex flex-wrap gap-1">
                    {number.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNumbers.length === 0 && (
          <Card className="glass">
            <CardContent className="text-center py-12">
              <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No numbers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get your first virtual number to get started"}
              </p>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Get Your First Number
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyNumbers
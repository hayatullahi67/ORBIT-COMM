import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { 
  Globe, 
  Plus, 
  Calendar,
  Wifi,
  MoreVertical,
  QrCode,
  Download,
  Trash2,
  Signal,
  MapPin
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MyESIMs = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const esims = [
    {
      id: 1,
      name: "Europe 30-Day",
      plan: "Premium Europe",
      country: "Multi-Country",
      region: "Europe",
      dataTotal: "10GB",
      dataUsed: "3.2GB",
      dataRemaining: "6.8GB",
      status: "Active",
      expires: "2024-11-15",
      activated: "2024-10-16",
      speed: "5G",
      countries: ["France", "Germany", "Italy", "Spain", "Netherlands"],
      price: "$29.99"
    },
    {
      id: 2,
      name: "Global Traveler",
      plan: "Worldwide Basic",
      country: "Global",
      region: "Worldwide",
      dataTotal: "5GB",
      dataUsed: "4.8GB",
      dataRemaining: "0.2GB",
      status: "Expiring",
      expires: "2024-10-03",
      activated: "2024-09-03",
      speed: "4G",
      countries: ["150+ Countries"],
      price: "$19.99"
    },
    {
      id: 3,
      name: "Asia Pacific",
      plan: "Business Asia",
      country: "Multi-Country",
      region: "Asia Pacific",
      dataTotal: "20GB",
      dataUsed: "0GB",
      dataRemaining: "20GB",
      status: "Inactive",
      expires: "2024-12-01",
      activated: null,
      speed: "5G",
      countries: ["Japan", "South Korea", "Singapore", "Australia"],
      price: "$49.99"
    },
    {
      id: 4,
      name: "USA Unlimited",
      plan: "Premium USA",
      country: "United States",
      region: "North America",
      dataTotal: "Unlimited",
      dataUsed: "45GB",
      dataRemaining: "Unlimited",
      status: "Active",
      expires: "2024-11-30",
      activated: "2024-09-01",
      speed: "5G",
      countries: ["United States"],
      price: "$39.99"
    }
  ]

  const filteredESIMs = esims.filter(esim => 
    esim.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    esim.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground"
      case "Inactive":
        return "bg-secondary text-secondary-foreground"
      case "Expiring":
        return "bg-warning text-warning-foreground"
      case "Expired":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getDataUsagePercentage = (used: string, total: string) => {
    if (total === "Unlimited") return 45
    const usedGB = parseFloat(used.replace("GB", ""))
    const totalGB = parseFloat(total.replace("GB", ""))
    return (usedGB / totalGB) * 100
  }

  const getUsageColor = (percentage: number) => {
    if (percentage > 90) return "bg-destructive"
    if (percentage > 75) return "bg-warning"
    return "bg-primary"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-space font-bold">My eSIMs</h1>
            <p className="text-muted-foreground">Manage your eSIM plans and global connectivity</p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Buy eSIM Plan
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search eSIMs</Label>
                <Input
                  id="search"
                  placeholder="Search by plan or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="glass">All Plans</Button>
                <Button variant="glass">Active Only</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* eSIMs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredESIMs.map((esim) => {
            const usagePercentage = getDataUsagePercentage(esim.dataUsed, esim.dataTotal)
            return (
              <Card key={esim.id} className="glass hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{esim.name}</CardTitle>
                      <CardDescription>{esim.plan}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(esim.status)}>
                      {esim.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <QrCode className="h-4 w-4 mr-2" />
                          Show QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Data Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Data Usage</span>
                      <span className="text-muted-foreground">
                        {esim.dataUsed} / {esim.dataTotal}
                      </span>
                    </div>
                    <Progress 
                      value={usagePercentage} 
                      className={`h-2 ${getUsageColor(usagePercentage)}`}
                    />
                    <div className="text-xs text-muted-foreground">
                      {esim.dataRemaining} remaining
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        Region
                      </div>
                      <div className="font-medium">{esim.region}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Signal className="h-3 w-3" />
                        Speed
                      </div>
                      <div className="font-medium">{esim.speed}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Expires
                      </div>
                      <div className="font-medium">
                        {new Date(esim.expires).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Wifi className="h-3 w-3" />
                        Status
                      </div>
                      <div className="font-medium">
                        {esim.activated ? "Activated" : "Not Activated"}
                      </div>
                    </div>
                  </div>

                  {/* Countries Covered */}
                  <div>
                    <div className="text-sm font-medium mb-2">Countries Covered:</div>
                    <div className="flex flex-wrap gap-1">
                      {esim.countries.map((country) => (
                        <Badge key={country} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {esim.status === "Inactive" ? (
                      <Button variant="hero" className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        Activate eSIM
                      </Button>
                    ) : (
                      <Button variant="glass" className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    )}
                    <Button variant="glass">
                      Renew
                    </Button>
                  </div>

                  {/* Pricing */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Plan Price:</span>
                      <span className="text-lg font-bold text-primary">{esim.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredESIMs.length === 0 && (
          <Card className="glass">
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No eSIMs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get your first eSIM plan to stay connected globally"}
              </p>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Browse eSIM Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyESIMs
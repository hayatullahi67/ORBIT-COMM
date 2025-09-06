import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Smartphone, 
  MessageSquare, 
  Wifi, 
  Phone,
  Twitter,
  Send,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Zap,
  Star,
  TrendingUp,
  Globe2,
  Shield,
  Clock,
  CreditCard
} from "lucide-react"

const CreativeFilter = () => {
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedService, setSelectedService] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filterTypes = [
    { id: "all", label: "All Services", icon: Zap, count: "2000+" },
    { id: "sms", label: "SMS Verification", icon: MessageSquare, count: "500+" },
    { id: "voice", label: "Voice Calls", icon: Phone, count: "200+" },
    { id: "esim", label: "eSIM Data", icon: Wifi, count: "150+" },
    { id: "rental", label: "Number Rental", icon: Smartphone, count: "300+" }
  ]

  const popularServices = [
    { id: "twitter", name: "Twitter", icon: Twitter, price: 0.15, category: "sms", rating: 4.9 },
    { id: "telegram", name: "Telegram", icon: Send, price: 0.12, category: "sms", rating: 4.8 },
    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, price: 0.18, category: "sms", rating: 4.9 },
    { id: "gmail", name: "Gmail", icon: Mail, price: 0.10, category: "sms", rating: 4.7 },
    { id: "instagram", name: "Instagram", icon: Instagram, price: 0.16, category: "sms", rating: 4.8 },
    { id: "facebook", name: "Facebook", icon: Facebook, price: 0.14, category: "sms", rating: 4.6 },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, price: 0.20, category: "sms", rating: 4.7 },
    { id: "github", name: "GitHub", icon: Github, price: 0.13, category: "sms", rating: 4.8 }
  ]

  const premiumCountries = [
    { code: "US", name: "United States", flag: "🇺🇸", multiplier: 1.0, quality: "Premium" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧", multiplier: 1.2, quality: "High" },
    { code: "CA", name: "Canada", flag: "🇨🇦", multiplier: 1.1, quality: "Premium" },
    { code: "DE", name: "Germany", flag: "🇩🇪", multiplier: 1.3, quality: "High" },
    { code: "FR", name: "France", flag: "🇫🇷", multiplier: 1.25, quality: "High" },
    { code: "JP", name: "Japan", flag: "🇯🇵", multiplier: 1.4, quality: "Premium" }
  ]

  const filteredServices = popularServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === "all" || service.category === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 animate-bounce">
            ⚡ AI-Powered Service Detection
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-manrope font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Intelligent Service
            </span>
            <br />
            <span className="text-foreground">Discovery Engine</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect communication solution with our advanced filtering system
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filterTypes.map((filter) => {
            const Icon = filter.icon
            return (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "glass"}
                size="sm"
                className="h-auto p-3 transition-all duration-300 hover:scale-105"
                onClick={() => setActiveFilter(filter.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium text-xs">{filter.label}</div>
                  <div className="text-xs text-muted-foreground">{filter.count}</div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass border-0 bg-background/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services Grid */}
          <Card className="glass border-0 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Popular Services
                <Badge variant="outline" className="ml-auto">
                  {filteredServices.length} available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {filteredServices.map((service) => {
                  const Icon = service.icon
                  return (
                    <Button
                      key={service.id}
                      variant={selectedService === service.id ? "default" : "glass"}
                      size="sm"
                      className="h-auto p-3 justify-start transition-all duration-300 hover:scale-102"
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">{service.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>${service.price}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{service.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Countries & Pricing */}
          <Card className="glass border-0 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe2 className="h-5 w-5 text-primary" />
                Premium Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {premiumCountries.map((country) => (
                  <Button
                    key={country.code}
                    variant={selectedCountry === country.code ? "default" : "glass"}
                    size="sm"
                    className="w-full h-auto p-3 justify-between transition-all duration-300 hover:scale-102"
                    onClick={() => setSelectedCountry(country.code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{country.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {country.quality} Quality
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {country.multiplier}x
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Live Pricing */}
              {selectedService && selectedCountry && (
                <div className="mt-6 p-4 glass rounded-lg border border-primary/20 animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Live Pricing</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />
                      Best Rate
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Base Price:</span>
                      <span>${popularServices.find(s => s.id === selectedService)?.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Location Multiplier:</span>
                      <span>{premiumCountries.find(c => c.code === selectedCountry)?.multiplier}x</span>
                    </div>
                    <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        ${((popularServices.find(s => s.id === selectedService)?.price || 0) * 
                          (premiumCountries.find(c => c.code === selectedCountry)?.multiplier || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="hero" size="sm" className="flex-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Get Instantly
                    </Button>
                    <Button variant="glass" size="sm" className="flex-1">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default CreativeFilter
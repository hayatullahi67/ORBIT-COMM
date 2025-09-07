import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { 
  Search, 
  Smartphone, 
  MessageSquare, 
  Star,
  Filter,
  ChevronDown,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  TrendingUp,
  Users,
  Shield
} from "lucide-react"

const Services = () => {
  const [selectedService, setSelectedService] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredService, setHoveredService] = useState("")
  const [hoveredCountry, setHoveredCountry] = useState("")

  const services = [
    { id: "whatsapp", name: "WhatsApp", icon: "💬", price: "$0.25", popular: true },
    { id: "telegram", name: "Telegram", icon: "✈️", price: "$0.20", popular: true },
    { id: "twitter", name: "Twitter", icon: "🐦", price: "$0.30", popular: true },
    { id: "instagram", name: "Instagram", icon: "📸", price: "$0.35", popular: false },
    { id: "facebook", name: "Facebook", icon: "📘", price: "$0.40", popular: false },
    { id: "discord", name: "Discord", icon: "🎮", price: "$0.25", popular: false },
    { id: "google", name: "Google", icon: "🔍", price: "$0.30", popular: true },
    { id: "amazon", name: "Amazon", icon: "📦", price: "$0.45", popular: false },
  ]

  const countries = [
    { id: "us", name: "United States", flag: "🇺🇸", price: "$0.25", numbers: "78,866", popular: true },
    { id: "uk", name: "United Kingdom", flag: "🇬🇧", price: "$0.30", numbers: "205,705", popular: true },
    { id: "ca", name: "Canada", flag: "🇨🇦", price: "$0.20", numbers: "52,171", popular: false },
    { id: "de", name: "Germany", flag: "🇩🇪", price: "$0.35", numbers: "45,123", popular: false },
    { id: "fr", name: "France", flag: "🇫🇷", price: "$0.28", numbers: "38,945", popular: false },
    { id: "au", name: "Australia", flag: "🇦🇺", price: "$0.32", numbers: "29,876", popular: false },
    { id: "jp", name: "Japan", flag: "🇯🇵", price: "$0.40", numbers: "25,432", popular: false },
    { id: "in", name: "India", flag: "🇮🇳", price: "$0.15", numbers: "125,678", popular: true },
  ]

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-primary/3 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 animate-bounce">
              <Zap className="h-3 w-3 mr-1" />
              Instant SMS Verification
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-manrope font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Virtual Numbers
              </span>
              <br />
              <span className="text-foreground/90">for SMS Verification</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Get instant virtual numbers from 190+ countries for any service verification. 
              Fast, secure, and reliable SMS delivery with real-time dashboard viewing.
            </p>
            
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { icon: Globe, label: "Countries", value: "190+" },
                { icon: Users, label: "Active Users", value: "50K+" },
                { icon: Clock, label: "Avg Response", value: "<2s" },
                { icon: TrendingUp, label: "Success Rate", value: "99.9%" }
              ].map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="glass rounded-xl p-4 group hover:shadow-glow transition-all duration-300">
                    <Icon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Enhanced Sidebar Filter */}
            <div className="lg:col-span-4">
              <Card className="glass border-0 sticky top-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Filter className="h-5 w-5 text-primary" />
                    </div>
                    SMS Deliveries
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs hover:bg-primary/10 hover:border-primary/30">
                      💰 Prices
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs hover:bg-secondary/10 hover:border-secondary/30">
                      📊 Statistics
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  {/* Service Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <span className="text-sm font-semibold">Select service</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto hover:bg-primary/10">
                        🔄
                      </Button>
                    </div>
                    
                    {selectedService && (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 animate-slide-up">
                        <span className="text-2xl">{services.find(s => s.id === selectedService)?.icon}</span>
                        <div className="flex-1">
                          <span className="text-sm font-semibold block">{services.find(s => s.id === selectedService)?.name}</span>
                          <span className="text-xs text-muted-foreground">Selected Service</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setSelectedService("")}
                        >
                          ❌
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Country Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <span className="text-sm font-semibold">Select country</span>
                    </div>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        placeholder="Find country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg -z-10" />
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-lg">
                      <Filter className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">by popularity</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                      <Badge variant="outline" className="text-xs">Sort</Badge>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {filteredCountries.map((country, index) => (
                        <div
                          key={country.id}
                          className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                            selectedCountry === country.id 
                              ? 'border-primary bg-gradient-to-r from-primary/10 to-secondary/10 shadow-glow' 
                              : 'border-border hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5'
                          }`}
                          onClick={() => setSelectedCountry(country.id)}
                          onMouseEnter={() => setHoveredCountry(country.id)}
                          onMouseLeave={() => setHoveredCountry("")}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              {country.popular && (
                                <div className="absolute top-2 right-2">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current animate-pulse" />
                                </div>
                              )}
                              <div className="text-xl group-hover:scale-110 transition-transform">{country.flag}</div>
                              <div>
                                <span className="text-sm font-semibold block">{country.name}</span>
                                <span className="text-xs text-success font-medium">{country.numbers} numbers</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">from {country.price}</div>
                              <div className="text-xs text-muted-foreground">per SMS</div>
                            </div>
                          </div>
                          {hoveredCountry === country.id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Get Number Button */}
                  {selectedService && selectedCountry && (
                    <div className="space-y-3 animate-slide-up">
                      <div className="p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl border border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-semibold">Ready to proceed</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {services.find(s => s.id === selectedService)?.name} • {countries.find(c => c.id === selectedCountry)?.name}
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 group" 
                        size="lg"
                      >
                        <MessageSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Get Number - {countries.find(c => c.id === selectedCountry)?.price}
                        <Zap className="h-4 w-4 ml-2 group-hover:animate-pulse" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content */}
            <div className="lg:col-span-8">
              {!selectedService ? (
                /* Enhanced Service Selection Grid */
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-primary text-primary-foreground rounded-lg">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    Choose Your Service
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {filteredServices.map((service, index) => (
                      <Card
                        key={service.id}
                        className={`glass border-0 cursor-pointer transition-all duration-300 group hover:shadow-glow hover:-translate-y-1 animate-slide-up ${
                          selectedService === service.id ? 'ring-2 ring-primary shadow-glow' : ''
                        }`}
                        onClick={() => setSelectedService(service.id)}
                        onMouseEnter={() => setHoveredService(service.id)}
                        onMouseLeave={() => setHoveredService("")}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-6 text-center relative overflow-hidden">
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                          <h3 className="font-semibold text-base mb-2">{service.name}</h3>
                          <p className="text-sm text-primary font-bold mb-3">from {service.price}</p>
                          {service.popular && (
                            <Badge variant="secondary" className="text-xs animate-pulse">
                              🔥 Popular
                            </Badge>
                          )}
                          {hoveredService === service.id && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Info Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <Card className="glass border-0">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Globe className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Over 500,000 Numbers</CardTitle>
                            <CardDescription>Originating from Around 180 Countries Online</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Here you can find virtual numbers from more than 180 countries. 
                          You can find phone numbers originating from pretty much anywhere, 
                          including the UK, Sweden, Germany, France, India, Indonesia, Malaysia, 
                          Cambodia, Mongolia, Canada, Thailand, Netherlands, Spain, etc.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass border-0">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/10 rounded-lg">
                            <Clock className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">New Virtual Numbers Added Daily</CardTitle>
                            <CardDescription>Fresh inventory every day</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Here, the pricing starts at one coin for a single number, 
                          and you will not have to pay for monthly SIM plans too. 
                          Get instant access to verification codes from any service.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                /* Service Details */
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedService("")}
                    >
                      ← Back
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{services.find(s => s.id === selectedService)?.icon}</span>
                      <h2 className="text-2xl font-bold">{services.find(s => s.id === selectedService)?.name} Verification</h2>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <Card className="glass border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                          How it works
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <p className="text-sm">Select {services.find(s => s.id === selectedService)?.name} and your preferred country</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <p className="text-sm">Receive your virtual number instantly</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <p className="text-sm">Use the number for {services.find(s => s.id === selectedService)?.name} verification</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <p className="text-sm">View SMS codes in your dashboard in real-time</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass border-0">
                      <CardHeader>
                        <CardTitle>Available Countries for {services.find(s => s.id === selectedService)?.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {countries.map((country) => (
                            <div
                              key={country.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-sm font-medium">{country.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-primary">{country.price}</div>
                                <div className="text-xs text-muted-foreground">{country.numbers} available</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Services
import { useState } from "react"
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
  Globe
} from "lucide-react"

const Services = () => {
  const [selectedService, setSelectedService] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

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
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-manrope font-bold mb-3">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Virtual Numbers
              </span>{" "}
              for SMS Verification
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get instant virtual numbers from 190+ countries for any service verification. 
              Fast, secure, and reliable SMS delivery.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar Filter */}
            <div className="lg:col-span-4">
              <Card className="glass border-0 sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    SMS Deliveries
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      💰 Prices
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      📊 Statistics
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">1. Select service</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        🔄
                      </Button>
                    </div>
                    
                    {selectedService && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                        <span className="text-lg">{services.find(s => s.id === selectedService)?.icon}</span>
                        <span className="text-sm font-medium">{services.find(s => s.id === selectedService)?.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-auto"
                          onClick={() => setSelectedService("")}
                        >
                          ❌
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Country Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">2. Select country</span>
                    </div>
                    
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Find country"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">by popularity</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                            selectedCountry === country.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setSelectedCountry(country.id)}
                        >
                          <div className="flex items-center gap-3">
                            {country.popular && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm font-medium">{country.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">from {country.price}</div>
                            <div className="text-xs text-success">{country.numbers} numbers</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Get Number Button */}
                  {selectedService && selectedCountry && (
                    <Button className="w-full" size="lg">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Get Number - {countries.find(c => c.id === selectedCountry)?.price}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8">
              {!selectedService ? (
                /* Service Selection Grid */
                <div>
                  <h2 className="text-xl font-semibold mb-4">Choose Your Service</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredServices.map((service) => (
                      <Card
                        key={service.id}
                        className={`glass border-0 cursor-pointer transition-all hover:shadow-glow group ${
                          selectedService === service.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{service.icon}</div>
                          <h3 className="font-medium text-sm mb-1">{service.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">from {service.price}</p>
                          {service.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
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
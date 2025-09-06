import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Smartphone, Globe, CreditCard } from "lucide-react"

const SMSFilter = () => {
  const [selectedService, setSelectedService] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [price, setPrice] = useState<number | null>(null)

  const services = [
    { id: "twitter", name: "Twitter", price: 0.15 },
    { id: "telegram", name: "Telegram", price: 0.12 },
    { id: "whatsapp", name: "WhatsApp", price: 0.18 },
    { id: "google", name: "Google", price: 0.10 },
    { id: "facebook", name: "Facebook", price: 0.14 },
    { id: "instagram", name: "Instagram", price: 0.16 },
    { id: "discord", name: "Discord", price: 0.13 },
    { id: "linkedin", name: "LinkedIn", price: 0.20 }
  ]

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸", multiplier: 1.0 },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧", multiplier: 1.2 },
    { code: "CA", name: "Canada", flag: "🇨🇦", multiplier: 1.1 },
    { code: "DE", name: "Germany", flag: "🇩🇪", multiplier: 1.3 },
    { code: "FR", name: "France", flag: "🇫🇷", multiplier: 1.25 },
    { code: "JP", name: "Japan", flag: "🇯🇵", multiplier: 1.4 },
    { code: "AU", name: "Australia", flag: "🇦🇺", multiplier: 1.35 },
    { code: "BR", name: "Brazil", flag: "🇧🇷", multiplier: 0.8 }
  ]

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    if (selectedCountry) {
      calculatePrice(serviceId, selectedCountry)
    }
  }

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
    if (selectedService) {
      calculatePrice(selectedService, countryCode)
    }
  }

  const calculatePrice = (serviceId: string, countryCode: string) => {
    const service = services.find(s => s.id === serviceId)
    const country = countries.find(c => c.code === countryCode)
    if (service && country) {
      setPrice(service.price * country.multiplier)
    }
  }

  const clearSelection = () => {
    setSelectedService("")
    setSelectedCountry("")
    setPrice(null)
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-manrope font-bold mb-3">
            Get Your <span className="bg-gradient-primary bg-clip-text text-transparent">Virtual Number</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Choose your service and country to get instant SMS verification
          </p>
        </div>

        <Card className="glass border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              SMS Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select Service</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {services.map((service) => (
                  <Button
                    key={service.id}
                    variant={selectedService === service.id ? "default" : "glass"}
                    size="sm"
                    className="h-auto p-3 justify-start"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-xs">{service.name}</div>
                      <div className="text-xs text-muted-foreground">${service.price}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Country Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select Country</label>
              <Select value={selectedCountry} onValueChange={handleCountrySelect}>
                <SelectTrigger className="glass border-border/50">
                  <SelectValue placeholder="Choose country..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span className="text-sm">{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Display */}
            {price && (
              <div className="flex items-center justify-between p-4 glass rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Total Price</div>
                    <div className="text-xs text-muted-foreground">
                      {services.find(s => s.id === selectedService)?.name} • {countries.find(c => c.code === selectedCountry)?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg font-bold">
                    ${price.toFixed(2)}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="hero" 
                className="flex-1"
                disabled={!selectedService || !selectedCountry}
              >
                Get Number Now
              </Button>
              <Button 
                variant="glass" 
                className="flex-1"
                disabled={!selectedService || !selectedCountry}
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default SMSFilter
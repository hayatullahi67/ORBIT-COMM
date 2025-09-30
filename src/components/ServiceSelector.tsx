



import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Smartphone,
  Globe,
  ArrowRight,
  MoreVertical,
  Instagram,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Signal,
  Phone,
  Loader2,
  Wifi
} from "lucide-react"

const ServiceSelector = () => {
  const [activeTab, setActiveTab] = useState<"sms" | "rentals" | "esims">("sms")

  // SMS States
  const [smsSelectedServices, setSmsSelectedServices] = useState<string[]>([])
  const [smsSelectedCountry, setSmsSelectedCountry] = useState<{ code: string, name: string } | null>(null)
  const [smsCountrySearchTerm, setSmsCountrySearchTerm] = useState('')
  const [smsIsPurchasing, setSmsIsPurchasing] = useState(false)

  // Rentals States
  const [rentalsSelectedServices, setRentalsSelectedServices] = useState<string[]>([])
  const [rentalsSelectedCountry, setRentalsSelectedCountry] = useState<{ code: string, name: string, iso: string } | null>(null)
  const [rentalsSelectedDuration, setRentalsSelectedDuration] = useState<string | null>(null)
  const [rentalsCountrySearchTerm, setRentalsCountrySearchTerm] = useState('')
  const [rentalsIsPurchasing, setRentalsIsPurchasing] = useState(false)

  // eSIMs States
  const [esimsSelectedCountry, setEsimsSelectedCountry] = useState<{ id: string, name: string, iso: string, flag_url: string } | null>(null)
  const [esimsSelectedPackageType, setEsimsSelectedPackageType] = useState<string | null>(null)
  const [esimsCountrySearchTerm, setEsimsCountrySearchTerm] = useState('')
  const [esimsIsPurchasing, setEsimsIsPurchasing] = useState(false)

  // SMS Service details mapping
  const smsServiceDetails = {
    ig: { name: 'Instagram', icon: Instagram },
    wa: { name: 'WhatsApp', icon: MessageSquare },
    tg: { name: 'Telegram', icon: Send },
    fb: { name: 'Facebook', icon: Facebook },
    tw: { name: 'Twitter', icon: Twitter },
    li: { name: 'LinkedIn', icon: Linkedin },
    sg: { name: 'Signal', icon: Signal },
    vi: { name: 'Viber', icon: Phone },
  }

  // Rentals service details
  const rentalsServiceDetails = [
    { code: 'wa', name: 'WhatsApp', icon: MessageSquare },
    { code: 'tg', name: 'Telegram', icon: MessageSquare },
    { code: 'ig', name: 'Instagram', icon: MessageSquare },
    { code: 'tw', name: 'Twitter', icon: MessageSquare },
    { code: 'fb', name: 'Facebook', icon: MessageSquare },
    { code: 'sg', name: 'Signal', icon: MessageSquare },
    { code: 'vi', name: 'Viber', icon: Phone },
    { code: 'li', name: 'LinkedIn', icon: MessageSquare },
  ]

  // SMS Countries
  const smsAvailableCountries = [
    { code: '187', name: 'United States' },
    { code: '16', name: 'United Kingdom' },
    { code: '43', name: 'Germany' },
    { code: '78', name: 'France' },
    { code: '36', name: 'Canada' },
    { code: '175', name: 'Australia' },
    { code: '48', name: 'Netherlands' },
    { code: '46', name: 'Sweden' },
    { code: '56', name: 'Spain' },
    { code: '86', name: 'Italy' },
    { code: '182', name: 'Japan' },
    { code: '22', name: 'India' },
    { code: '73', name: 'Brazil' },
    { code: '196', name: 'Singapore' },
    { code: '95', name: 'United Arab Emirates' },
    { code: '37', name: 'Morocco' }
  ]

  // Rentals Countries
  const rentalsAvailableCountries = [
    { code: 'US', name: 'United States', iso: 'US' },
    { code: 'GB', name: 'United Kingdom', iso: 'GB' },
    { code: 'CA', name: 'Canada', iso: 'CA' },
    { code: 'DE', name: 'Germany', iso: 'DE' },
    { code: 'FR', name: 'France', iso: 'FR' },
    { code: 'IT', name: 'Italy', iso: 'IT' },
    { code: 'ES', name: 'Spain', iso: 'ES' },
    { code: 'NL', name: 'Netherlands', iso: 'NL' },
    { code: 'AU', name: 'Australia', iso: 'AU' },
    { code: 'JP', name: 'Japan', iso: 'JP' },
    { code: 'KR', name: 'South Korea', iso: 'KR' },
    { code: 'SG', name: 'Singapore', iso: 'SG' },
    { code: 'HK', name: 'Hong Kong', iso: 'HK' },
    { code: 'IN', name: 'India', iso: 'IN' },
    { code: 'BR', name: 'Brazil', iso: 'BR' },
    { code: 'MX', name: 'Mexico', iso: 'MX' }
  ]

  // eSIMs Countries
  const esimsAvailableCountries = [
    { id: '1', name: 'United States', iso: 'US', flag_url: 'https://flagcdn.com/w20/us.png' },
    { id: '2', name: 'United Kingdom', iso: 'GB', flag_url: 'https://flagcdn.com/w20/gb.png' },
    { id: '3', name: 'Germany', iso: 'DE', flag_url: 'https://flagcdn.com/w20/de.png' },
    { id: '4', name: 'France', iso: 'FR', flag_url: 'https://flagcdn.com/w20/fr.png' },
    { id: '5', name: 'Canada', iso: 'CA', flag_url: 'https://flagcdn.com/w20/ca.png' },
    { id: '6', name: 'Australia', iso: 'AU', flag_url: 'https://flagcdn.com/w20/au.png' },
    { id: '7', name: 'Japan', iso: 'JP', flag_url: 'https://flagcdn.com/w20/jp.png' },
    { id: '8', name: 'Singapore', iso: 'SG', flag_url: 'https://flagcdn.com/w20/sg.png' }
  ]

  const rentalDurations = [
    { code: '7d', name: '7 Days', price: 15 },
    { code: '30d', name: '30 Days', price: 45 },
    { code: '90d', name: '90 Days', price: 120 },
  ]

  const smsCountryCodeToIso: Record<string, string> = {
    '187': 'US', '16': 'GB', '43': 'DE', '78': 'FR', '36': 'CA', '175': 'AU',
    '48': 'NL', '46': 'SE', '56': 'ES', '86': 'IT', '182': 'JP', '22': 'IN',
    '73': 'BR', '196': 'SG', '95': 'AE', '37': 'MA'
  }

  const smsFilteredCountries = smsAvailableCountries.filter(country =>
    country.name.toLowerCase().includes(smsCountrySearchTerm.toLowerCase())
  )

  const rentalsFilteredCountries = rentalsAvailableCountries.filter(country =>
    country.name.toLowerCase().includes(rentalsCountrySearchTerm.toLowerCase())
  )

  const esimsFilteredCountries = esimsAvailableCountries.filter(country =>
    country.name.toLowerCase().includes(esimsCountrySearchTerm.toLowerCase())
  )

  const getFlagEmoji = (countryCode: string) => {
    return String.fromCodePoint(...[...countryCode.toUpperCase()].map(char => 0x1F1A5 + char.charCodeAt(0)))
  }

  const handleGetNumber = () => {
    setSmsIsPurchasing(true)
    setTimeout(() => {
      setSmsIsPurchasing(false)
      window.location.href = '/auth/login'
    }, 1000)
  }

  const handleRentNumber = () => {
    setRentalsIsPurchasing(true)
    setTimeout(() => {
      setRentalsIsPurchasing(false)
      window.location.href = '/auth/login'
    }, 1000)
  }

  const handleBuyEsim = () => {
    setEsimsIsPurchasing(true)
    setTimeout(() => {
      setEsimsIsPurchasing(false)
      window.location.href = '/auth/login'
    }, 1000)
  }

  const resetTab = (tab: "sms" | "rentals" | "esims") => {
    setActiveTab(tab)
    setSmsSelectedServices([])
    setSmsSelectedCountry(null)
    setSmsCountrySearchTerm('')
    setRentalsSelectedServices([])
    setRentalsSelectedCountry(null)
    setRentalsSelectedDuration(null)
    setRentalsCountrySearchTerm('')
    setEsimsSelectedCountry(null)
    setEsimsSelectedPackageType(null)
    setEsimsCountrySearchTerm('')
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-manrope font-bold mb-4">
            <span className="text-slate-800 dark:text-slate-100">
              Try Our Services
            </span>{" "}
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">
              Live
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            Explore our virtual numbers, rentals, and eSIMs from 180+ countries. See real availability and pricing.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/30 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* SMS Tab Content */}
            {activeTab === "sms" && (
              <>
                {/* SMS Sidebar */}
                <div className="w-full lg:w-80 bg-gradient-to-b from-slate-50/90 to-white/90 dark:from-slate-800/90 dark:to-slate-900/90 border-r border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                  <div className="p-4 lg:p-6 space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-200/60 dark:border-slate-700/60 pb-4">
                      {/* Service Type Tabs */}
                      <div className="justify-center mb-3">
                        <div className="flex bg-white/80 dark:bg-slate-800/80 rounded-xl p-1 shadow-lg border border-slate-200/50 dark:border-slate-700/50 w-4/5 backdrop-blur-sm">
                          <Button
                            variant={activeTab === "sms" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => resetTab("sms")}
                            className={`flex items-center gap-1 text-xs px-3 py-2 h-8 flex-1 rounded-lg font-medium transition-all duration-200 ${activeTab === "sms"
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                              : "hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                              }`}
                          >
                            <MessageSquare className="h-3 w-3" />
                            SMS
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTab("rentals")}
                            className="flex items-center gap-1 text-xs px-3 py-2 h-8 flex-1 rounded-lg font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                          >
                            <Smartphone className="h-3 w-3" />
                            Rentals
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTab("esims")}
                            className="flex items-center gap-1 text-xs px-3 py-2 h-8 flex-1 rounded-lg font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                          >
                            <Globe className="h-3 w-3" />
                            eSIMs
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-sm flex items-center justify-center shadow-sm">
                            <span className="text-[10px] text-white font-bold">$</span>
                          </div>
                          <span className="text-blue-700 dark:text-blue-300">Prices</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <div className="w-3 h-3 border-2 border-slate-400 dark:border-slate-500 rounded-sm"></div>
                          <span className="text-slate-600 dark:text-slate-400">Statistics</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Select Service */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">1. Select service</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {smsSelectedServices.length > 0 ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500 hover:text-red-600"
                            onClick={() => setSmsSelectedServices([])}
                          >
                            ✕
                          </Button>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const ServiceIcon = smsServiceDetails[smsSelectedServices[0]]?.icon || Instagram
                              return <ServiceIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            })()}
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{smsServiceDetails[smsSelectedServices[0]]?.name || smsSelectedServices[0]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(smsServiceDetails).slice(0, 3).map(([code, service]) => (
                            <button
                              key={code}
                              onClick={() => setSmsSelectedServices([code])}
                              className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-200 shadow-sm hover:shadow-md group"
                            >
                              <service.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{service.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Step 2: Select Country */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">2. Select country</h3>

                      {smsSelectedCountry ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500 hover:text-red-600"
                            onClick={() => setSmsSelectedCountry(null)}
                          >
                            ✕
                          </Button>
                          <span className="text-lg">{getFlagEmoji(smsCountryCodeToIso[smsSelectedCountry.code] || 'XX')}</span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{smsSelectedCountry.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Input
                            placeholder="Search countries..."
                            value={smsCountrySearchTerm}
                            onChange={(e) => setSmsCountrySearchTerm(e.target.value)}
                            className="text-sm bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                          />
                          <ScrollArea className="h-32">
                            <div className="space-y-2">
                              {smsFilteredCountries.slice(0, 5).map((country) => (
                                <button
                                  key={country.code}
                                  onClick={() => setSmsSelectedCountry(country)}
                                  className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 hover:border-green-200 dark:hover:border-green-700/50 transition-all duration-200 text-left shadow-sm hover:shadow-md group"
                                >
                                  <span className="text-base">{getFlagEmoji(smsCountryCodeToIso[country.code] || 'XX')}</span>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{country.name}</span>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Select Operator */}
                    {smsSelectedCountry && smsSelectedServices.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">3. Select operator</h3>

                        <div className="space-y-3">
                          {[
                            { name: 'Virtual58', success: '78.66%', count: 625, price: 11.4, best: true },
                            { name: 'Virtual38', success: '72.84%', count: 504, price: 15, best: false }
                          ].map((operator) => (
                            <div key={operator.name} className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                              {operator.best && (
                                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-200 text-xs font-semibold px-3 py-1 rounded-lg mb-3 inline-block border border-amber-200 dark:border-amber-700/50">
                                  ⭐ BEST OPERATOR
                                </div>
                              )}
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{operator.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{operator.price}</span>
                                  <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 rounded-full px-2 py-1 font-medium border border-blue-200 dark:border-blue-700/50">€</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm mb-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <span>📧 {operator.success}</span>
                                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">&gt;1 SMS</span>
                                </div>
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {operator.count} numbers
                                </span>
                              </div>
                              <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl py-2.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
                                onClick={handleGetNumber}
                                disabled={smsIsPurchasing}
                              >
                                {smsIsPurchasing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <span>🛒 Get Number</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SMS Main Content */}
                <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
                  {!smsSelectedServices.length ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Over 500,000 Numbers Originating from Around 180 Countries Online</h3>
                      <p className="text-muted-foreground max-w-2xl">
                        Here you can find virtual numbers from more than 180 countries. You can find phone numbers originating from pretty much anywhere, including the UK, Sweden, Germany, France, India, Indonesia, Malaysia, Cambodia, Mongolia, Canada, Thailand, Netherlands, Spain, etc.
                      </p>
                    </div>
                  ) : !smsSelectedCountry ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                        <Globe className="h-8 w-8 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">New Virtual Numbers Added Daily</h3>
                      <p className="text-muted-foreground max-w-2xl">
                        Here, the pricing starts at one coin for a single number, and you will not have to pay for monthly SIM plans too
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                        <Smartphone className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Single-Use Numbers and Multiple SMS Deliveries</h3>
                      <p className="text-muted-foreground max-w-2xl mb-6">
                        Get instant access to virtual numbers for {smsServiceDetails[smsSelectedServices[0]]?.name} verification in {smsSelectedCountry.name}. Start receiving SMS immediately after purchase.
                      </p>
                      <Button size="lg" asChild>
                        <Link to="/auth/login">
                          Get Started Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Rentals Tab Content */}
            {activeTab === "rentals" && (
              <>
                {/* Rentals Sidebar */}
                <div className="w-full lg:w-80 bg-background/50 border-r border-border/20">
                  <div className="p-4 lg:p-6 space-y-6">
                    {/* Header */}
                    <div className="border-b pb-4">
                      {/* Service Type Tabs */}
                      <div className=" justify-center mb-3">
                        <div className="flex bg-background rounded-md p-0.5 shadow-sm border w-4/5">
                          <Button
                            // variant={activeTab === "sms" ? "default" : "ghost"}
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTab("sms")}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7 flex-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            SMS
                          </Button>
                          <Button
                            variant={activeTab === "rentals" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => resetTab("rentals")}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7 flex-1"
                          >
                            <Smartphone className="h-3 w-3" />
                            Rentals
                          </Button>
                          <Button
                            // variant={activeTab === "esims" ? "default" : "ghost"}
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTab("esims")}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7 flex-1"
                          >
                            <Globe className="h-3 w-3" />
                            eSIMs
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <div className="w-3 h-3 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-[10px] text-white">$</span>
                          </div>
                          Prices
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="w-3 h-3 border rounded-sm"></div>
                          Coverage
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Select Service */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">1. Select service</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {rentalsSelectedServices.length > 0 ? (
                        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setRentalsSelectedServices([])}
                          >
                            ✕
                          </Button>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const serviceData = rentalsServiceDetails.find(s => s.code === rentalsSelectedServices[0])
                              const ServiceIcon = serviceData?.icon || MessageSquare
                              return (
                                <>
                                  <ServiceIcon className="h-5 w-5 text-primary" />
                                  <span className="text-sm">{serviceData?.name || rentalsSelectedServices[0]}</span>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {rentalsServiceDetails.slice(0, 3).map((service) => (
                            <button
                              key={service.code}
                              onClick={() => setRentalsSelectedServices([service.code])}
                              className="w-full bg-muted/30 rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                            >
                              <service.icon className="h-5 w-5 text-primary" />
                              <span className="text-sm">{service.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Step 2: Select Country */}
                    <div className="space-y-3">
                      <h3 className="font-medium">2. Select country</h3>

                      {rentalsSelectedCountry ? (
                        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setRentalsSelectedCountry(null)}
                          >
                            ✕
                          </Button>
                          <span className="text-lg">{getFlagEmoji(rentalsSelectedCountry.iso)}</span>
                          <span className="text-sm">{rentalsSelectedCountry.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            placeholder="Search countries..."
                            value={rentalsCountrySearchTerm}
                            onChange={(e) => setRentalsCountrySearchTerm(e.target.value)}
                            className="text-sm"
                          />
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {rentalsFilteredCountries.slice(0, 5).map((country) => (
                                <button
                                  key={country.code}
                                  onClick={() => setRentalsSelectedCountry(country)}
                                  className="w-full bg-muted/30 rounded-lg p-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <span className="text-sm">{getFlagEmoji(country.iso)}</span>
                                  <span className="text-sm">{country.name}</span>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Select Duration */}
                    {rentalsSelectedCountry && rentalsSelectedServices.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-medium">3. Select duration</h3>

                        <div className="space-y-2">
                          {rentalDurations.map((duration, index) => (
                            <div key={duration.code} className="border rounded-lg p-3">
                              {index === 1 && (
                                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                                  MOST POPULAR
                                </div>
                              )}
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{duration.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold">${duration.price}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <span>📅 {duration.name} rental</span>
                                </div>
                                <span className="text-green-600">
                                  Available
                                </span>
                              </div>
                              <Button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => {
                                  setRentalsSelectedDuration(duration.code)
                                  handleRentNumber()
                                }}
                                disabled={rentalsIsPurchasing}
                              >
                                {rentalsIsPurchasing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span>🏠 Rent Now</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rentals Main Content */}
                <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                      <Smartphone className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Long-term Number Rentals</h3>
                    <p className="text-muted-foreground max-w-2xl mb-6">
                      Rent virtual numbers for extended periods. Perfect for business use, long-term verification needs, or maintaining a consistent presence in multiple countries.
                    </p>
                    <Button size="lg" asChild>
                      <Link to="/auth/login">
                        Start Renting
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* eSIMs Tab Content */}
            {activeTab === "esims" && (
              <>
                {/* eSIMs Sidebar */}
                <div className="w-full lg:w-80 bg-background/50 border-r border-border/20">
                  <div className="p-4 lg:p-6 space-y-6">
                    {/* Header */}
                    <div className="border-b pb-4">
                      {/* Service Type Tabs */}
                      <div className=" justify-center mb-3">
                        <div className="flex bg-background rounded-md p-0.5 shadow-sm border w-4/5">
                          <Button
                            // variant={activeTab === "sms" ? "default" : "ghost"}
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTab("sms")}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7 flex-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            SMS
                          </Button>
                          <Button
                            // variant={activeTab === "rentals" ? "default" : "ghost"}
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTab("rentals")}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7 flex-1"
                          >
                            <Smartphone className="h-3 w-3" />
                            Rentals
                          </Button>
                          <Button
                            variant={activeTab === "esims" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => resetTab("esims")}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7 flex-1"
                          >
                            <Globe className="h-3 w-3" />
                            eSIMs
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <div className="w-3 h-3 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-[10px] text-white">$</span>
                          </div>
                          Prices
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="w-3 h-3 border rounded-sm"></div>
                          Coverage
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Select Country */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">1. Select country</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {esimsSelectedCountry ? (
                        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setEsimsSelectedCountry(null)}
                          >
                            ✕
                          </Button>
                          <img
                            src={esimsSelectedCountry.flag_url}
                            alt={`${esimsSelectedCountry.name} flag`}
                            className="w-5 h-3 object-cover rounded-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <span className="text-sm">{esimsSelectedCountry.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            placeholder="Search countries..."
                            value={esimsCountrySearchTerm}
                            onChange={(e) => setEsimsCountrySearchTerm(e.target.value)}
                            className="text-sm"
                          />
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {esimsFilteredCountries.slice(0, 5).map((country) => (
                                <button
                                  key={country.id}
                                  onClick={() => setEsimsSelectedCountry(country)}
                                  className="w-full bg-muted/30 rounded-lg p-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <img
                                    src={country.flag_url}
                                    alt={`${country.name} flag`}
                                    className="w-4 h-3 object-cover rounded-sm"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                  <span className="text-sm">{country.name}</span>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Select Package Type */}
                    {esimsSelectedCountry && (
                      <div className="space-y-3">
                        <h3 className="font-medium">2. Select package type</h3>

                        {esimsSelectedPackageType ? (
                          <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEsimsSelectedPackageType(null)}
                            >
                              ✕
                            </Button>
                            <div className="flex items-center gap-2">
                              {esimsSelectedPackageType === 'DATA-ONLY' ? (
                                <Wifi className="h-4 w-4 text-primary" />
                              ) : (
                                <Globe className="h-4 w-4 text-primary" />
                              )}
                              <span className="text-sm">
                                {esimsSelectedPackageType === 'DATA-ONLY' ? 'Data Only' : 'Data + Voice + SMS'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => setEsimsSelectedPackageType('DATA-ONLY')}
                              className="w-full bg-muted/30 rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                            >
                              <Wifi className="h-4 w-4 text-primary" />
                              <span className="text-sm">Data Only</span>
                            </button>
                            <button
                              onClick={() => setEsimsSelectedPackageType('DATA-VOICE-SMS')}
                              className="w-full bg-muted/30 rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                            >
                              <Globe className="h-4 w-4 text-primary" />
                              <span className="text-sm">Data + Voice + SMS</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Select Plan */}
                    {esimsSelectedCountry && esimsSelectedPackageType && (
                      <div className="space-y-3">
                        <h3 className="font-medium">3. Select plan</h3>

                        <div className="space-y-2">
                          {[
                            { id: '1', name: '1GB - 7 Days', data: '1GB', validity: '7 days', price: 15 },
                            { id: '2', name: '5GB - 30 Days', data: '5GB', validity: '30 days', price: 45 },
                            { id: '3', name: '10GB - 30 Days', data: '10GB', validity: '30 days', price: 60 }
                          ].map((pkg, index) => (
                            <div key={pkg.id} className="border rounded-lg p-3">
                              {index === 0 && (
                                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                                  BEST VALUE
                                </div>
                              )}
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{pkg.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold">${pkg.price}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <span>📊 {pkg.data}</span>
                                  <span>{pkg.validity}</span>
                                </div>
                                <span className="text-green-600">
                                  Available
                                </span>
                              </div>
                              <Button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={handleBuyEsim}
                                disabled={esimsIsPurchasing}
                              >
                                {esimsIsPurchasing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span>🛒</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* eSIMs Main Content */}
                <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                      <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Global eSIM Connectivity</h3>
                    <p className="text-muted-foreground max-w-2xl mb-6">
                      Stay connected worldwide with our instant eSIM plans. No physical SIM card needed - activate instantly with a QR code and enjoy high-speed data in 180+ countries.
                    </p>
                    <Button size="lg" asChild>
                      <Link to="/auth/login">
                        Get eSIM Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceSelector
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  FaFacebook,
  FaGoogle,
  FaInstagram,
  FaWeixin,
  FaTwitter,
  FaSnapchat,
  FaTiktok,
  FaLinkedin,
  FaWhatsapp,
  FaTelegram,
} from "react-icons/fa"

const CreativeFilter = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [serviceSearch, setServiceSearch] = useState("")
  const [countrySearch, setCountrySearch] = useState("")

  // 10+ services so left list scrolls
  const services = [
    { id: "google", name: "Google Messenger", count: 715028, icon: <FaGoogle /> },
    { id: "instagram", name: "Instagram + Threads", count: 8028792, icon: <FaInstagram /> },
    { id: "wechat", name: "WeChat", count: 6586033, icon: <FaWeixin /> },
    { id: "facebook", name: "Facebook", count: 8994472, icon: <FaFacebook /> },
    { id: "twitter", name: "Twitter (X)", count: 1200344, icon: <FaTwitter /> },
    { id: "snapchat", name: "Snapchat", count: 450334, icon: <FaSnapchat /> },
    { id: "tiktok", name: "TikTok", count: 788433, icon: <FaTiktok /> },
    { id: "linkedin", name: "LinkedIn", count: 334899, icon: <FaLinkedin /> },
    { id: "whatsapp", name: "WhatsApp", count: 909221, icon: <FaWhatsapp /> },
    { id: "telegram", name: "Telegram", count: 502344, icon: <FaTelegram /> },
  ]

  // Many countries for scrolling — each service uses the same long list for demo
  const manyCountries = [
    { id: "us", name: "United States", flag: "🇺🇸", count: 19118, price: 46.09 },
    { id: "uk", name: "United Kingdom", flag: "🇬🇧", count: 8000, price: 35.44 },
    { id: "fr", name: "France", flag: "🇫🇷", count: 6200, price: 25.12 },
    { id: "de", name: "Germany", flag: "🇩🇪", count: 7000, price: 28.33 },
    { id: "ng", name: "Nigeria", flag: "🇳🇬", count: 5000, price: 9.99 },
    { id: "in", name: "India", flag: "🇮🇳", count: 15000, price: 12.55 },
    { id: "cn", name: "China", flag: "🇨🇳", count: 20000, price: 11.77 },
    { id: "sg", name: "Singapore", flag: "🇸🇬", count: 4000, price: 18.22 },
    { id: "br", name: "Brazil", flag: "🇧🇷", count: 8000, price: 14.44 },
    { id: "es", name: "Spain", flag: "🇪🇸", count: 3500, price: 17.88 },
    { id: "ca", name: "Canada", flag: "🇨🇦", count: 4100, price: 21.33 },
    { id: "au", name: "Australia", flag: "🇦🇺", count: 4200, price: 29.99 },
    { id: "jp", name: "Japan", flag: "🇯🇵", count: 3300, price: 31.22 },
  ]

  // map each service to manyCountries for demo
  const serviceCountries: Record<string, typeof manyCountries> = services.reduce(
    (acc, s) => ((acc[s.id] = manyCountries), acc),
    {} as Record<string, typeof manyCountries>
  )

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  const filteredCountries =
    selectedService && serviceCountries[selectedService]
      ? serviceCountries[selectedService].filter((c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase())
        )
      : []

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* SERVICES */}
        <Card className="shadow-sm border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Choose a service</CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            {/* Search is sticky — stays in place */}
            <div className="relative mb-3 sticky top-0  z-10 pt-2 pb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Scrollable list: only the list scrolls under the sticky search */}
            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-2">
              {filteredServices.map((service) => {
                const isSelected = selectedService === service.id

                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id)
                      setSelectedCountry(null)
                    }}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-md border transition
                      ${
                        // SELECTED: light bg + black text (user requested click -> black text)
                        isSelected
                          ? "bg-gray-100 text-black border-black"
                          : // DEFAULT (not selected): dark bg with white text; on hover -> light bg + black text
                            "bg-neutral-900 text-white border-neutral-900 hover:bg-gray-100 hover:text-black hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{service.icon}</span>
                      <div className="truncate">
                        <div className="font-medium truncate">{service.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className={`text-xs ${isSelected ? "text-black" : "text-opacity-80"}`}>
                        {service.count.toLocaleString()} pcs
                      </span>
                      {/* small selection dot when selected */}
                      {isSelected ? (
                        <span className="w-3 h-3 rounded-full bg-black" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-white/60" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* COUNTRIES */}
        <Card className="shadow-sm border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Choose the country</CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            {selectedService ? (
              <>
                <div className="relative mb-3 sticky top-0  z-10 pt-2 pb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-[420px] overflow-y-auto space-y-2 pr-2">
                  {filteredCountries.map((country) => {
                    const isSelected = selectedCountry === country.id

                    return (
                      <div
                        key={country.id}
                        className={`flex items-center justify-between w-full px-3 py-3 rounded-md border transition
                          ${
                            isSelected
                              ? "bg-gray-100 text-black border-black"
                              : "bg-neutral-900 text-white border-neutral-900 hover:bg-gray-100 hover:text-black hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl flex-shrink-0">{country.flag}</span>
                          <div className="truncate">
                            <div className="font-medium truncate">{country.name}</div>
                            <div className={`text-xs ${isSelected ? "text-black" : "text-white text-opacity-70"}`}>
                              {country.count.toLocaleString()} pcs
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          <span className={`font-medium ${isSelected ? "text-black" : "text-white"}`}>
                            {country.price}₽
                          </span>
                          <Button
                            size="sm"
                            className={`text-xs px-3 py-1 ${
                              isSelected ? "bg-black text-white hover:bg-gray-800" : "bg-black text-white hover:bg-gray-800"
                            }`}
                            onClick={() => setSelectedCountry(country.id)}
                          >
                            Buy
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Please choose a service first</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default CreativeFilter

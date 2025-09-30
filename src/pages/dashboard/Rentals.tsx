import React, { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  Phone,
  Plus,
  Calendar,
  MoreVertical,
  Copy,
  RefreshCw,
  Trash2,
  MessageSquare,
  Clock,
  MapPin,
  Loader2,
  AlertTriangle,
  CreditCard,
  CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface RentalNumber {
  id: number;
  number: string;
  activationId?: string;
  country: string;
  countryCode: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  duration: string;
  messagesCount: number;
  lastUsed: string;
  services: string[];
  price: string;
  isActive: boolean;
}

const Rentals = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; iso: string } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ status: 'success' | 'error'; message: string; number?: string } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Mock rental numbers data
  const [rentalNumbers, setRentalNumbers] = useState<RentalNumber[]>(() => {
    try {
      const storedRentals = window.localStorage.getItem('myRentalNumbers');
      return storedRentals ? JSON.parse(storedRentals) : [];
    } catch (error) {
      console.error("Error reading rentals from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('myRentalNumbers', JSON.stringify(rentalNumbers));
    } catch (error) {
      console.error("Error writing rentals to localStorage", error);
    }
  }, [rentalNumbers]);

  // Hardcoded countries for rentals
  const hardcodedCountries = [
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
    { code: 'MX', name: 'Mexico', iso: 'MX' },
    { code: 'AR', name: 'Argentina', iso: 'AR' },
    { code: 'ZA', name: 'South Africa', iso: 'ZA' },
    { code: 'AE', name: 'United Arab Emirates', iso: 'AE' },
    { code: 'TR', name: 'Turkey', iso: 'TR' },
  ];

  // Hardcoded services for rentals
  const hardcodedServices = [
    { code: 'wa', name: 'WhatsApp', icon: MessageSquare },
    { code: 'tg', name: 'Telegram', icon: MessageSquare },
    { code: 'ig', name: 'Instagram', icon: MessageSquare },
    { code: 'tw', name: 'Twitter', icon: MessageSquare },
    { code: 'fb', name: 'Facebook', icon: MessageSquare },
    { code: 'sg', name: 'Signal', icon: MessageSquare },
    { code: 'vi', name: 'Viber', icon: Phone },
    { code: 'li', name: 'LinkedIn', icon: MessageSquare },
    { code: 'dc', name: 'Discord', icon: MessageSquare },
    { code: 'yt', name: 'YouTube', icon: MessageSquare },
  ];

  const rentalDurations = [
    { code: '7d', name: '7 Days', price: 15 },
    { code: '30d', name: '30 Days', price: 45 },
    { code: '90d', name: '90 Days', price: 120 },
  ];

  const filteredCountries = useMemo(() =>
    hardcodedCountries.filter(country =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
    ), [countrySearchTerm]
  );

  const filteredRentals = rentalNumbers.filter(rental =>
    rental.number.includes(searchTerm) ||
    rental.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFlagEmoji = (countryCode: string) => {
    return String.fromCodePoint(...[...countryCode.toUpperCase()].map(char => 0x1F1A5 + char.charCodeAt(0)));
  };

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
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Rental":
        return "bg-primary text-primary-foreground"
      case "Long-term":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  };

  const handleRentNumber = async () => {
    if (!selectedCountry || selectedServices.length === 0 || !selectedDuration) return;

    setIsPurchasing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const duration = rentalDurations.find(d => d.code === selectedDuration);
      const newRental: RentalNumber = {
        id: Date.now(),
        number: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        country: selectedCountry.name,
        countryCode: selectedCountry.iso,
        type: 'Rental',
        status: 'Active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (duration?.code === '7d' ? 7 : duration?.code === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString(),
        duration: duration?.name || '7 Days',
        messagesCount: 0,
        lastUsed: 'Just now',
        services: selectedServices.map(s => hardcodedServices.find(service => service.code === s)?.name || s),
        price: `$${duration?.price || 15}`,
        isActive: true
      };

      setRentalNumbers(prev => [newRental, ...prev]);
      setPurchaseResult({ status: 'success', message: 'Number rented successfully!', number: newRental.number });
      setIsResultModalOpen(true);

      // Reset selections
      setSelectedCountry(null);
      setSelectedServices([]);
      setSelectedDuration(null);
    } catch (error: any) {
      setPurchaseResult({ status: 'error', message: `Failed to rent number: ${error.message}` });
      setIsResultModalOpen(true);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Purchase Result Dialog */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="sm:max-w-md">
          {purchaseResult?.status === 'success' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-success" />
                  Success!
                </DialogTitle>
                <DialogDescription>
                  Your number has been rented successfully.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">Your rental number is:</p>
                <p className="text-2xl font-bold font-mono text-primary my-2">{purchaseResult.number}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsResultModalOpen(false)}>Done</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Rental Failed
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">{purchaseResult?.message}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW UI - RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-120px)]">
        {/* Sidebar - Number Rental Flow */}
        <div className="w-full lg:w-80 bg-card border rounded-lg p-4 lg:p-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-primary">Number Rentals</h2>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white">$</span>
                  </div>
                  Prices
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border rounded-sm"></div>
                  Duration
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

              {selectedServices.length > 0 ? (
                <div className="space-y-2">
                  {selectedServices.map(service => {
                    const serviceData = hardcodedServices.find(s => s.code === service);
                    return (
                      <div key={service} className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedServices(prev => prev.filter(s => s !== service))}
                        >
                          ✕
                        </Button>
                        <div className="flex items-center gap-2">
                          {React.createElement(serviceData?.icon || MessageSquare, { className: "h-4 w-4 text-primary" })}
                          <span className="text-sm">{serviceData?.name || service}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {hardcodedServices.slice(0, 3).map((service) => (
                    <button
                      key={service.code}
                      onClick={() => setSelectedServices([service.code])}
                      className="w-full bg-muted/30 rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <service.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{service.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Select Country */}
            <div className="space-y-3">
              <h3 className="font-medium">2. Select country</h3>

              {selectedCountry ? (
                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedCountry(null)}
                  >
                    ✕
                  </Button>
                  <span className="text-lg">{getFlagEmoji(selectedCountry.iso)}</span>
                  <span className="text-sm">{selectedCountry.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Search countries..."
                    value={countrySearchTerm}
                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                    className="text-sm"
                  />
                  {false ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {filteredCountries.slice(0, 5).map((country) => (
                          <button
                            key={country.code}
                            onClick={() => setSelectedCountry(country)}
                            className="w-full bg-muted/30 rounded-lg p-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <span className="text-sm">{getFlagEmoji(country.iso)}</span>
                            <span className="text-sm">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Select Duration */}
            {selectedCountry && selectedServices.length > 0 && (
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
                        <span className="font-medium text-sm">{duration.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">${duration.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <span>📅 {duration.name} rental</span>
                        </div>
                        <span className="text-green-600">Available</span>
                      </div>
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          setSelectedDuration(duration.code);
                          handleRentNumber();
                        }}
                        disabled={isPurchasing}
                      >
                        {isPurchasing ? (
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

        {/* Main Content - Rental Numbers History */}
        <div className="flex-1 space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">My Rentals</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Your rented numbers history
                {rentalNumbers.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {rentalNumbers.length} rental{rentalNumbers.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <Input
              placeholder="Search by number or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>

          {/* Rentals Grid */}
          {filteredRentals.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Rentals Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Rent your first number using the sidebar on the left for long-term use.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRentals.map((rental) => (
                <Card key={rental.id} className="glass">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-lg">{getFlagEmoji(rental.countryCode)}</span>
                          <div className="min-w-0">
                            <p className="font-mono text-sm sm:text-lg font-medium truncate">{rental.number}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{rental.country}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`${getStatusColor(rental.status)} text-xs`}>
                            {rental.status}
                          </Badge>
                          <Badge className={`${getTypeColor(rental.type)} text-xs`}>
                            {rental.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <div className="text-right flex-1 sm:flex-none">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium">{rental.duration}</p>
                        </div>
                        <div className="text-right flex-1 sm:flex-none">
                          <p className="text-xs text-muted-foreground">Ends</p>
                          <p className="text-xs sm:text-sm font-medium">
                            {new Date(rental.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-1 sm:flex-none">
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-xs sm:text-sm font-medium text-primary">{rental.price}</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rental.number)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Number
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Extend Rental
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setRentalNumbers(prev => prev.filter(r => r.id !== rental.id));
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Rental
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {rental.services.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {rental.services.map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Rentals
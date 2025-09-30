import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  MapPin,
  Loader2,
  AlertTriangle,
  Phone,
  MessageSquare,
  Clock,
  Network,
  X,
  CreditCard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getEsimCountries, getEsimPackages, getEsimPackageDetails, purchaseEsimPackage, EsimPackage, EsimPackageDetails, EsimPurchaseResponse } from "@/lib/esim-api"
import { getStoredEsims, saveEsimToStorage, removeEsimFromStorage, convertPurchaseToStoredEsim, StoredEsim } from "@/lib/esim-storage"

const MyESIMs = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Country, 2: Package Type, 3: Packages
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string; iso: string; flag_url: string } | null>(null);
  const [selectedPackageType, setSelectedPackageType] = useState<'DATA-ONLY' | 'DATA-VOICE-SMS' | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isPackageDetailsOpen, setIsPackageDetailsOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<EsimPurchaseResponse | null>(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [storedEsims, setStoredEsims] = useState<StoredEsim[]>([]);
  const [selectedEsimForQR, setSelectedEsimForQR] = useState<StoredEsim | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Load eSIMs from localStorage on component mount and refresh when purchases are made
  useEffect(() => {
    const loadStoredEsims = () => {
      const stored = getStoredEsims();
      console.log('📱 COMPONENT: Loading stored eSIMs from localStorage:', stored.length);
      setStoredEsims(stored);
    };

    loadStoredEsims();

    // Listen for storage changes (in case user has multiple tabs open)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'purchased_esims') {
        loadStoredEsims();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // Remove API fetching for user eSIMs - use only local storage
  const isLoading = false;
  const error = null;

  // --- Modal Data Fetching ---
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['esimCountries'],
    queryFn: () => {
      console.log('🚀 REACT QUERY: Starting countries fetch...');
      return getEsimCountries();
    },
    enabled: true // Fetch countries immediately when component loads
  });

  const { data: packages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['esimPackages', selectedCountry?.id, selectedPackageType],
    queryFn: () => {
      console.log('🚀 REACT QUERY: Starting packages fetch for countryId:', selectedCountry?.id);
      console.log('🚀 REACT QUERY: Package type:', selectedPackageType);
      console.log('🚀 REACT QUERY: Full selected country object:', selectedCountry);
      return getEsimPackages(selectedCountry!.id, selectedPackageType!);
    },
    enabled: !!selectedCountry && !!selectedPackageType && modalStep === 3 // Only fetch when country and package type are selected
  });

  const { data: packageDetails, isLoading: isLoadingPackageDetails } = useQuery({
    queryKey: ['esimPackageDetails', selectedPackageId],
    queryFn: () => {
      console.log('🚀 REACT QUERY: Starting package details fetch for packageId:', selectedPackageId);
      return getEsimPackageDetails(selectedPackageId!);
    },
    enabled: !!selectedPackageId && isPackageDetailsOpen // Only fetch when package is selected and modal is open
  });

  const [countrySearchTerm, setCountrySearchTerm] = useState('');



  const filteredCountries = useMemo(() => {
    if (!countries) return [];

    return countries
      .filter((country: any) =>
        country.name?.toLowerCase().includes(countrySearchTerm.toLowerCase())
      )
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [countries, countrySearchTerm]);

  const handleCountrySelect = (country: any) => {
    console.log('🎯 COUNTRY SELECT: Raw country data:', country);
    console.log('🎯 COUNTRY SELECT: Country ID:', country.id);
    console.log('🎯 COUNTRY SELECT: Country name:', country.name);

    const countryData = {
      id: country.id.toString(),
      name: country.name,
      iso: country.iso,
      flag_url: country.flag_url
    };

    console.log('🎯 COUNTRY SELECT: Final country data:', countryData);
    setSelectedCountry(countryData);
    setModalStep(2); // Go to package type selection
  };

  const handlePackageTypeSelect = (packageType: 'DATA-ONLY' | 'DATA-VOICE-SMS') => {
    console.log('📱 PACKAGE TYPE SELECT:', packageType);
    setSelectedPackageType(packageType);
    setModalStep(3); // Go to packages list
  };

  const handlePackageSelect = (packageId: string) => {
    console.log('📋 PACKAGE SELECT:', packageId);
    setSelectedPackageId(packageId);
    setIsPackageDetailsOpen(true);
  };

  const handlePackageDetailsClose = () => {
    setIsPackageDetailsOpen(false);
    setTimeout(() => {
      setSelectedPackageId(null);
      setPurchaseResult(null);
      setShowPurchaseSuccess(false);
    }, 300);
  };

  const handlePurchase = async () => {
    if (!packageDetails || !selectedPackageType || !selectedCountry) return;

    setIsPurchasing(true);
    try {
      console.log('💳 Starting purchase for package:', packageDetails.id);
      const result = await purchaseEsimPackage(packageDetails.id, selectedPackageType);
      console.log('✅ Purchase successful:', result);

      // Convert purchase response to stored eSIM format
      const storedEsim = convertPurchaseToStoredEsim(
        result,
        packageDetails,
        selectedPackageType,
        selectedCountry
      );

      // Save to localStorage
      saveEsimToStorage(storedEsim);

      // Update local state to refresh the display
      const updatedEsims = getStoredEsims();
      setStoredEsims(updatedEsims);
      console.log('📱 PURCHASE: Updated stored eSIMs count:', updatedEsims.length);

      setPurchaseResult(result);
      setShowPurchaseSuccess(true);

      console.log('💾 eSIM saved to localStorage:', storedEsim.name);
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      // You can add error handling here (toast notification, etc.)
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleModalClose = () => {
    setIsBuyModalOpen(false);
    // Reset state after a delay for animation
    setTimeout(() => {
      setModalStep(1);
      setSelectedCountry(null);
      setSelectedPackageType(null);
      setCountrySearchTerm('');
    }, 300);
  };

  const handleDeleteEsim = (esimId: string) => {
    console.log('🗑️ DELETING: eSIM with ID:', esimId);
    removeEsimFromStorage(esimId);

    // Update local state
    const updatedEsims = getStoredEsims();
    setStoredEsims(updatedEsims);
    console.log('📱 DELETE: Updated stored eSIMs count:', updatedEsims.length);
  };

  const handleShowQRCode = (esim: any) => {
    console.log('📱 QR CODE: Opening QR modal for eSIM:', esim.id);
    console.log('🔍 SELECTED ESIM FOR QR:', esim);
    console.log('🔍 PURCHASE DATA:', esim.purchaseData);
    setSelectedEsimForQR(esim);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setTimeout(() => {
      setSelectedEsimForQR(null);
    }, 300);
  };
  // --- End Modal Logic ---

  // Use only stored eSIMs from localStorage
  const displayEsims = useMemo(() => {
    console.log('📱 DISPLAY: Using stored eSIMs only:', storedEsims.length);
    return storedEsims;
  }, [storedEsims]);

  const filteredESIMs = (displayEsims).filter((esim: any) =>
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
      {/* OLD UI - COMMENTED OUT */}
      {/* <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-space font-bold">My eSIMs</h1>
            <p className="text-muted-foreground">
              Manage your eSIM plans and global connectivity
              {storedEsims.length > 0 && (
                <span className="ml-2 text-primary font-medium">
                  • {storedEsims.length} purchased eSIM{storedEsims.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <Button variant="hero" onClick={() => {
            console.log('🛒 MODAL: Opening Buy eSIM modal - this should trigger countries fetch');
            setIsBuyModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Buy eSIM Plan
          </Button>
        </div>

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
      </div> */}

      {/* NEW UI - RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-120px)]">
        {/* Sidebar - eSIM Purchase Flow */}
        <div className="w-full lg:w-80 bg-card border rounded-lg p-4 lg:p-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-primary">eSIM Plans</h2>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white">$</span>
                  </div>
                  Prices
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border rounded-sm"></div>
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
                  <img
                    src={selectedCountry.flag_url}
                    alt={`${selectedCountry.name} flag`}
                    className="w-5 h-4 object-cover rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
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
                  {isLoadingCountries ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : countries && countries.length > 0 ? (
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {filteredCountries.slice(0, 5).map((country: any) => (
                          <button
                            key={country.id}
                            onClick={() => handleCountrySelect(country)}
                            className="w-full bg-muted/30 rounded-lg p-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <img
                              src={country.flag_url}
                              alt={`${country.name} flag`}
                              className="w-4 h-3 object-cover rounded-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span className="text-sm">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      No countries available at the moment.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Select Package Type */}
            {selectedCountry && (
              <div className="space-y-3">
                <h3 className="font-medium">2. Select package type</h3>

                {selectedPackageType ? (
                  <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setSelectedPackageType(null)}
                    >
                      ✕
                    </Button>
                    <div className="flex items-center gap-2">
                      {selectedPackageType === 'DATA-ONLY' ? (
                        <Wifi className="h-4 w-4 text-primary" />
                      ) : (
                        <Globe className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm">
                        {selectedPackageType === 'DATA-ONLY' ? 'Data Only' : 'Data + Voice + SMS'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handlePackageTypeSelect('DATA-ONLY')}
                      className="w-full bg-muted/30 rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <Wifi className="h-4 w-4 text-primary" />
                      <span className="text-sm">Data Only</span>
                    </button>
                    <button
                      onClick={() => handlePackageTypeSelect('DATA-VOICE-SMS')}
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
            {selectedCountry && selectedPackageType && (
              <div className="space-y-3">
                <h3 className="font-medium">3. Select plan</h3>

                {isLoadingPackages ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : packages && packages.length > 0 ? (
                  <div className="space-y-2">
                    {packages.slice(0, 2).map((pkg: EsimPackage, index) => (
                      <div key={pkg.id} className="border rounded-lg p-3">
                        {index === 0 && (
                          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                            BEST VALUE
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{pkg.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">${pkg.price.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <span>📊 {pkg.data}</span>
                            <span>{pkg.validity}</span>
                          </div>
                          <span className="text-green-600">Available</span>
                        </div>
                        <Button
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handlePackageSelect(pkg.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span>🛒</span>
                          </div>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No plans available for this combination.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - eSIMs History */}
        <div className="flex-1 space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">My eSIMs</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Your purchased eSIM plans history
                {storedEsims.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {storedEsims.length} plan{storedEsims.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <Input
              placeholder="Search by plan or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>

          {/* eSIMs Grid */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Card className="glass border-destructive/50 bg-destructive/10">
              <CardHeader className="flex-row items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Failed to load eSIMs</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{error.message}</CardContent>
            </Card>
          )}

          {filteredESIMs.length === 0 && !isLoading && !error ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No eSIMs Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get your first eSIM plan using the sidebar on the left to stay connected globally.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredESIMs.map((esim) => {
                const usagePercentage = getDataUsagePercentage(esim.dataUsed, esim.dataTotal)
                return (
                  <Card key={esim.id} className="glass">
                    <CardContent className="p-4">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <Globe className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base leading-tight truncate">{esim.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{esim.plan}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                          <div className="text-right flex-1 sm:flex-none">
                            <p className="text-xs text-muted-foreground">Data Usage</p>
                            <p className="text-xs sm:text-sm font-medium">{esim.dataUsed} / {esim.dataTotal}</p>
                          </div>
                          <div className="text-right flex-1 sm:flex-none">
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className="text-xs sm:text-sm font-medium">
                              {new Date(esim.expires).toLocaleDateString()}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShowQRCode(esim)}>
                                <QrCode className="h-4 w-4 mr-2" />
                                Show QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteEsim(esim.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Status and Badges Row */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getStatusColor(esim.status)} text-xs`}>
                          {esim.status}
                        </Badge>
                        {esim.purchaseDate && (
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Purchased
                          </Badge>
                        )}
                      </div>

                      {/* Data Usage Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-muted-foreground">Data Usage</span>
                          <span className="text-muted-foreground text-xs">
                            {esim.dataRemaining} remaining
                          </span>
                        </div>
                        <Progress
                          value={usagePercentage}
                          className="h-2"
                        />
                      </div>

                      {/* Compact Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs">Region</span>
                          </div>
                          <div className="font-medium text-xs truncate">{esim.region}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Signal className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs">Speed</span>
                          </div>
                          <div className="font-medium text-xs">{esim.speed}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Wifi className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs">Status</span>
                          </div>
                          <div className="font-medium text-xs">
                            {esim.activated ? "Activated" : "Not Activated"}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <CreditCard className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs">Price</span>
                          </div>
                          <div className="font-medium text-xs text-primary">{esim.price}</div>
                        </div>
                      </div>

                      {/* Countries Covered */}
                      {esim.countries.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Countries Covered:</p>
                          <div className="flex flex-wrap gap-1">
                            {esim.countries.slice(0, 3).map((country) => (
                              <Badge key={country} variant="outline" className="text-xs px-2 py-0">
                                {country}
                              </Badge>
                            ))}
                            {esim.countries.length > 3 && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                +{esim.countries.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* OLD UI - COMMENTED OUT */}
      {/* {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="glass border-destructive/50 bg-destructive/10">
            <CardHeader className="flex-row items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">Failed to load eSIMs</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{error.message}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OLD GRID UI - COMMENTED OUT */}
      {/* {filteredESIMs.map((esim) => {
            const usagePercentage = getDataUsagePercentage(esim.dataUsed, esim.dataTotal)
            return (
              <Card key={esim.id} className="glass hover:shadow-glow transition-all duration-300 border border-border/50 shadow-md hover:shadow-lg hover:border-primary/30">
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
                    {esim.purchaseDate && (
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Purchased
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowQRCode(esim)}>
                          <QrCode className="h-4 w-4 mr-2" />
                          Show QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteEsim(esim.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
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
                    {esim.purchaseDate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Purchased
                        </div>
                        <div className="font-medium text-xs">
                          {new Date(esim.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

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

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Plan Price:</span>
                      <span className="text-lg font-bold text-primary">{esim.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })} */}
      {/* </div> */}

      {/* {!isLoading && filteredESIMs.length === 0 && (
          <Card className="glass">
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No eSIMs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : storedEsims.length === 0 && !error
                    ? "No eSIMs purchased at the moment. Get your first eSIM plan to stay connected globally"
                    : error
                      ? "Unable to load eSIMs from server. Any purchased eSIMs will appear here once the connection is restored."
                      : "All your eSIMs are filtered out by the current search"
                }
              </p>
              <Button variant="hero" onClick={() => setIsBuyModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buy eSIM Plan
              </Button>
            </CardContent>
          </Card>
        )} */}

      {/* Buy eSIM Modal */}
      <Dialog open={isBuyModalOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-2xl p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl">Buy a New eSIM</DialogTitle>
            <DialogDescription>
              {modalStep === 1 && "Select a country to view available plans."}
              {modalStep === 2 && `Select package type for ${selectedCountry?.name}`}
              {modalStep === 3 && `Available ${selectedPackageType} plans for ${selectedCountry?.name}`}
            </DialogDescription>
          </DialogHeader>

          {modalStep === 1 && (
            <div className="px-6 pb-6">
              <Input
                placeholder="Search for a country..."
                value={countrySearchTerm}
                onChange={(e) => setCountrySearchTerm(e.target.value)}
                className="mb-4 glass"
              />
              {isLoadingCountries ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-4">
                    {filteredCountries.map((country: any) => (
                      <button
                        key={country.id || country.name}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors text-left border border-transparent hover:border-primary/20"
                      >
                        <img
                          src={country.flag_url}
                          alt={`${country.name} flag`}
                          className="w-6 h-4 object-cover rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-sm font-medium">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {modalStep === 2 && (
            <div className="px-6 pb-6">
              <Button variant="ghost" onClick={() => setModalStep(1)} className="mb-4">
                &larr; Back to Countries
              </Button>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Package Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className="glass hover:border-primary/50 transition-all duration-200 cursor-pointer border border-border/30 shadow-md hover:shadow-lg"
                    onClick={() => handlePackageTypeSelect('DATA-ONLY')}
                  >
                    <CardContent className="p-6 text-center">
                      <Wifi className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h4 className="font-bold mb-2">DATA-ONLY</h4>
                      <p className="text-sm text-muted-foreground">Internet data only</p>
                    </CardContent>
                  </Card>
                  <Card
                    className="glass hover:border-primary/50 transition-all duration-200 cursor-pointer border border-border/30 shadow-md hover:shadow-lg"
                    onClick={() => handlePackageTypeSelect('DATA-VOICE-SMS')}
                  >
                    <CardContent className="p-6 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h4 className="font-bold mb-2">DATA-VOICE-SMS</h4>
                      <p className="text-sm text-muted-foreground">Data + Voice + SMS</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {modalStep === 3 && (
            <div className="px-6 pb-6">
              <Button variant="ghost" onClick={() => setModalStep(2)} className="mb-4">
                &larr; Back to Package Type
              </Button>
              {isLoadingPackages ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {packages && packages.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-4">
                        {packages.map((pkg: EsimPackage) => (
                          <Card
                            key={pkg.id}
                            className="glass hover:border-primary/50 transition-all duration-200 cursor-pointer border border-border/30 shadow-md hover:shadow-lg"
                            onClick={() => handlePackageSelect(pkg.id)}
                          >
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-bold">{pkg.name} - {pkg.data}</p>
                                <p className="text-sm text-muted-foreground">{pkg.validity} validity</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary">${pkg.price.toFixed(2)}</span>
                                <Button variant="hero" size="sm">View Details</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No eSIM Plans Available</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        Unfortunately, there are no {selectedPackageType?.replace('-', ' ').toLowerCase()} eSIM plans available for {selectedCountry?.name} at the moment.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="glass" onClick={() => setModalStep(2)}>
                          Try Different Package Type
                        </Button>
                        <Button variant="glass" onClick={() => setModalStep(1)}>
                          Choose Different Country
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Package Details Modal */}
      <Dialog open={isPackageDetailsOpen} onOpenChange={(open) => !open && handlePackageDetailsClose()}>
        <DialogContent className="sm:max-w-4xl p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Package Details</DialogTitle>
                <DialogDescription>
                  Review package information before purchase
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handlePackageDetailsClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {isLoadingPackageDetails ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : packageDetails ? (
            <ScrollArea className="max-h-[70vh]">
              <div className="p-6 space-y-6">
                {/* Package Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">{packageDetails.name}</h2>
                  <div className="text-4xl font-bold text-primary">${packageDetails.price}</div>
                </div>

                {/* Package Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass border border-border/30 shadow-md">
                    <CardContent className="p-4 text-center">
                      <Wifi className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-bold text-lg">{packageDetails.data_quantity} {packageDetails.data_unit}</div>
                      <div className="text-sm text-muted-foreground">Data</div>
                    </CardContent>
                  </Card>

                  {packageDetails.voice_quantity > 0 && (
                    <Card className="glass border border-border/30 shadow-md">
                      <CardContent className="p-4 text-center">
                        <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-bold text-lg">{packageDetails.voice_quantity} {packageDetails.voice_unit}</div>
                        <div className="text-sm text-muted-foreground">Voice</div>
                      </CardContent>
                    </Card>
                  )}

                  {packageDetails.sms_quantity > 0 && (
                    <Card className="glass border border-border/30 shadow-md">
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-bold text-lg">{packageDetails.sms_quantity}</div>
                        <div className="text-sm text-muted-foreground">SMS</div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="glass border border-border/30 shadow-md">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-bold text-lg">{packageDetails.package_validity} {packageDetails.package_validity_unit}s</div>
                      <div className="text-sm text-muted-foreground">Validity</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Countries Coverage */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Countries Covered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packageDetails.countries.map((country) => (
                      <Card key={country.id} className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={country.image_url}
                              alt={`${country.name} flag`}
                              className="w-8 h-6 object-cover rounded-sm"
                            />
                            <span className="font-semibold">{country.name}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Network Coverage:</div>
                            {country.network_coverage.map((network, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span>{network.network_name}</span>
                                <div className="flex gap-1">
                                  {network.two_g && <Badge variant="secondary" className="text-xs">2G</Badge>}
                                  {network.three_g && <Badge variant="secondary" className="text-xs">3G</Badge>}
                                  {network.four_G && <Badge variant="secondary" className="text-xs">4G</Badge>}
                                  {network.five_G && <Badge variant="secondary" className="text-xs">5G</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Roaming Countries (if different from main countries) */}
                {packageDetails.romaing_countries && packageDetails.romaing_countries.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Roaming Coverage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packageDetails.romaing_countries.map((country) => (
                        <Card key={country.id} className="glass">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={country.image_url}
                                alt={`${country.name} flag`}
                                className="w-8 h-6 object-cover rounded-sm"
                              />
                              <span className="font-semibold">{country.name}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">Network Coverage:</div>
                              {country.network_coverage.map((network, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span>{network.network_name}</span>
                                  <div className="flex gap-1">
                                    {network.two_g && <Badge variant="secondary" className="text-xs">2G</Badge>}
                                    {network.three_g && <Badge variant="secondary" className="text-xs">3G</Badge>}
                                    {network.four_G && <Badge variant="secondary" className="text-xs">4G</Badge>}
                                    {network.five_G && <Badge variant="secondary" className="text-xs">5G</Badge>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button variant="glass" className="flex-1" onClick={handlePackageDetailsClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase Package - ${packageDetails.price}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Package Details</h3>
              <p className="text-muted-foreground mb-4">
                Unable to fetch package information. Please try again.
              </p>
              <Button variant="glass" onClick={handlePackageDetailsClose}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Purchase Success Modal */}
      <Dialog open={showPurchaseSuccess} onOpenChange={(open) => !open && setShowPurchaseSuccess(false)}>
        <DialogContent className="sm:max-w-2xl p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl text-center">🎉 Purchase Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your eSIM package has been purchased successfully
            </DialogDescription>
          </DialogHeader>

          {purchaseResult && (
            <div className="p-6 space-y-6">
              {/* Purchase Summary */}
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Package Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-medium">{purchaseResult.data.package?.package_name || purchaseResult.data.sim?.last_bundle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="secondary">{purchaseResult.data.package?.status || purchaseResult.data.sim?.status || 'Active'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Activated:</span>
                      <span className="font-medium">{purchaseResult.data.package?.date_activated || purchaseResult.data.date_activated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="font-medium">{purchaseResult.data.package?.date_expiry || purchaseResult.data.date_expiry}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SIM Information */}
              {purchaseResult.data.sim && (
                <Card className="glass">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">SIM Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>SIM ID:</span>
                        <span className="font-mono text-xs">{purchaseResult.data.sim.id}</span>
                      </div>
                      {purchaseResult.data.sim.iccid && (
                        <div className="flex justify-between">
                          <span>ICCID:</span>
                          <span className="font-mono text-xs">{purchaseResult.data.sim.iccid}</span>
                        </div>
                      )}
                      {purchaseResult.data.sim.number && (
                        <div className="flex justify-between">
                          <span>Phone Number:</span>
                          <span className="font-medium">{purchaseResult.data.sim.number}</span>
                        </div>
                      )}
                      {purchaseResult.data.sim.apn && (
                        <div className="flex justify-between">
                          <span>APN:</span>
                          <span className="font-medium">{purchaseResult.data.sim.apn}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>SIM Status:</span>
                        <Badge variant="secondary">{purchaseResult.data.sim.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Information */}
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Data Allowance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Initial Data:</span>
                      <span className="font-medium">
                        {purchaseResult.data.package?.initial_data_quantity || purchaseResult.data.initial_data_quantity} {purchaseResult.data.package?.initial_data_unit || purchaseResult.data.initial_data_unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Data:</span>
                      <span className="font-medium">
                        {purchaseResult.data.package?.rem_data_quantity || purchaseResult.data.rem_data_quantity} {purchaseResult.data.package?.rem_data_unit || purchaseResult.data.rem_data_unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unlimited:</span>
                      <span className="font-medium">{(purchaseResult.data.package?.unlimited || purchaseResult.data.unlimited) ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {purchaseResult.message && (
                <div className="text-center text-sm text-muted-foreground">
                  {purchaseResult.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button variant="glass" className="flex-1" onClick={() => setShowPurchaseSuccess(false)}>
                  Close
                </Button>
                <Button variant="hero" className="flex-1" onClick={() => {
                  setShowPurchaseSuccess(false);
                  handlePackageDetailsClose();
                  handleModalClose();
                }}>
                  View My eSIMs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={(open) => !open && handleCloseQRModal()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/20">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              eSIM Activation Details
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Use this information to activate your eSIM on your device
            </DialogDescription>
          </DialogHeader>

          {selectedEsimForQR && (
            <ScrollArea className="max-h-[65vh]">
              <div className="p-6 space-y-6">
                {/* eSIM Name */}
                <div className="text-center py-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-xl text-primary">{selectedEsimForQR.name}</h3>
                  <p className="text-muted-foreground mt-1 flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedEsimForQR.country}
                  </p>
                </div>



                {/* Activation Information */}
                <div className="space-y-4">
                  {/* QR Code Text */}
                  {(() => {
                    const qrCodeText = selectedEsimForQR.qr_code_text || selectedEsimForQR.purchaseData?.data?.qr_code_text;
                    console.log('📱 QR CODE TEXT:', qrCodeText);
                    return qrCodeText ? (
                      <Card className="glass border border-primary/20 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <QrCode className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-semibold text-base">QR Code Data</span>
                              <p className="text-xs text-muted-foreground">Scan this with your device camera</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <code className="text-sm break-all font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                              {qrCodeText}
                            </code>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}

                  {/* ICCID */}
                  {(() => {
                    const iccid = selectedEsimForQR.iccid || selectedEsimForQR.purchaseData?.data?.simIccid;
                    console.log('🔑 ICCID:', iccid);
                    return iccid ? (
                      <Card className="glass border border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <span className="font-semibold text-base">ICCID</span>
                              <p className="text-xs text-muted-foreground">Integrated Circuit Card Identifier</p>
                            </div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <code className="text-sm break-all font-mono text-green-800 dark:text-green-200 leading-relaxed">
                              {iccid}
                            </code>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}

                  {/* SM-DP+ Address */}
                  {(() => {
                    const smdpAddress = selectedEsimForQR.smdp_address || selectedEsimForQR.purchaseData?.data?.smdp_address;
                    console.log('🌐 SMDP ADDRESS:', smdpAddress);
                    return smdpAddress ? (
                      <Card className="glass border border-border/30 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Network className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">SM-DP+ Address</span>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <code className="text-xs break-all font-mono">
                              {smdpAddress}
                            </code>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}

                  {/* Matching ID */}
                  {(() => {
                    const matchingId = selectedEsimForQR.matching_id || selectedEsimForQR.purchaseData?.data?.matching_id;
                    console.log('🎯 MATCHING ID:', matchingId);
                    return matchingId ? (
                      <Card className="glass border border-border/30 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Matching ID</span>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <code className="text-xs break-all font-mono">
                              {matchingId}
                            </code>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}

                  {/* Show message if no activation data found */}
                  {!selectedEsimForQR.qr_code_text &&
                    !selectedEsimForQR.purchaseData?.data?.qr_code_text &&
                    !selectedEsimForQR.iccid &&
                    !selectedEsimForQR.purchaseData?.data?.simIccid && (
                      <Card className="glass border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <CardContent className="p-4 text-center">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            No activation data available for this eSIM. This might be a mock eSIM or the purchase data is incomplete.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to Activate:</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Go to Settings → Cellular/Mobile Data</li>
                    <li>2. Tap "Add eSIM" or "Add Cellular Plan"</li>
                    <li>3. Scan the QR code or enter details manually</li>
                    <li>4. Follow the on-screen instructions</li>
                  </ol>
                </div>

              </div>
            </ScrollArea>
          )}

          {/* Close Button - Fixed at bottom */}
          <div className="p-6 pt-0">
            <Button onClick={handleCloseQRModal} className="w-full" variant="hero">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout >
  )
}

export default MyESIMs
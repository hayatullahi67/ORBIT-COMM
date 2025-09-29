import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useTigerSmsPrices } from "@/hooks/useTigerSmsPrices"
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
  Shield,
  Send,
  Phone,
  Linkedin,
  Wifi,
  Calendar,
  CreditCard,
  MapPin,
  Signal,
  Download,
  Repeat
} from "lucide-react"
import { FaWhatsapp, FaTelegramPlane, FaTwitter, FaInstagram, FaFacebook, FaDiscord, FaGoogle, FaAmazon } from "react-icons/fa"

const Services = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("sms")
  const [selectedService, setSelectedService] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredService, setHoveredService] = useState("")
  const [hoveredCountry, setHoveredCountry] = useState("")
  const [selectedRentalPlan, setSelectedRentalPlan] = useState("")
  const [selectedEsimPlan, setSelectedEsimPlan] = useState("")

  // Fetch live pricing data
  const { prices, loading: pricesLoading, error: pricesError } = useTigerSmsPrices();

  // Country and service mappings from MyNumbers.tsx
  const countryNames: Record<string, string> = {
    '74': 'Afghanistan', '155': 'Albania', '58': 'Algeria', '76': 'Angola', '181': 'Anguilla', '169': 'Antigua and Barbuda', '39': 'Argentina', '148': 'Armenia', '179': 'Aruba', '175': 'Australia', '50': 'Austria', '35': 'Azerbaijan', '122': 'Bahamas', '145': 'Bahrain', '60': 'Bangladesh', '118': 'Barbados', '51': 'Belarus', '82': 'Belgium', '124': 'Belize', '120': 'Benin', '195': 'Bermuda', '158': 'Bhutan', '92': 'Bolivia', '108': 'Bosnia and Herzegovina', '123': 'Botswana', '73': 'Brazil', '121': 'Brunei Darussalam', '83': 'Bulgaria', '152': 'Burkina Faso', '119': 'Burundi', '24': 'Cambodia', '41': 'Cameroon', '36': 'Canada', '186': 'Cape Verde', '170': 'Cayman Islands', '125': 'Central African Republic', '42': 'Chad', '151': 'Chile', '3': 'China', '33': 'Colombia', '133': 'Comoros', '150': 'Congo (Dem. Republic)', '18': 'Congo', '93': 'Costa Rica', '27': "Côte d'Ivoire", '45': 'Croatia', '113': 'Cuba', '77': 'Cyprus', '63': 'Czech Republic', '172': 'Denmark', '168': 'Djibouti', '126': 'Dominica', '109': 'Dominican Republic', '105': 'Ecuador', '21': 'Egypt', '101': 'El Salvador', '167': 'Equatorial Guinea', '176': 'Eritrea', '34': 'Estonia', '71': 'Ethiopia', '189': 'Fiji', '163': 'Finland', '78': 'France', '162': 'French Guiana', '154': 'Gabon', '28': 'Gambia', '128': 'Georgia', '43': 'Germany', '38': 'Ghana', '201': 'Gibraltar', '129': 'Greece', '127': 'Grenada', '160': 'Guadeloupe', '94': 'Guatemala', '68': 'Guinea', '130': 'Guinea-Bissau', '131': 'Guyana', '26': 'Haiti', '88': 'Honduras', '14': 'Hong Kong', '84': 'Hungary', '132': 'Iceland', '22': 'India', '6': 'Indonesia', '57': 'Iran', '47': 'Iraq', '23': 'Ireland', '13': 'Israel', '86': 'Italy', '103': 'Jamaica', '182': 'Japan', '116': 'Jordan', '2': 'Kazakhstan', '8': 'Kenya', '190': 'Korea', '203': 'Kosovo', '100': 'Kuwait', '11': 'Kyrgyzstan', '25': 'Laos', '49': 'Latvia', '153': 'Lebanon', '136': 'Lesotho', '135': 'Liberia', '102': 'Libya', '44': 'Lithuania', '165': 'Luxembourg', '20': 'Macau', '183': 'North Macedonia', '17': 'Madagascar', '137': 'Malawi', '7': 'Malaysia', '159': 'Maldives', '69': 'Mali', '199': 'Malta', '114': 'Mauritania', '157': 'Mauritius', '54': 'Mexico', '85': 'Moldova', '144': 'Monaco', '72': 'Mongolia', '171': 'Montenegro', '180': 'Montserrat', '37': 'Morocco', '80': 'Mozambique', '5': 'Myanmar', '138': 'Namibia', '81': 'Nepal', '48': 'Netherlands', '185': 'New Caledonia', '67': 'New Zealand', '90': 'Nicaragua', '139': 'Niger', '19': 'Nigeria', '174': 'Norway', '107': 'Oman', '66': 'Pakistan', '188': 'Palestine', '112': 'Panama', '79': 'Papua New Guinea', '87': 'Paraguay', '65': 'Peru', '4': 'Philippines', '15': 'Poland', '117': 'Portugal', '97': 'Puerto Rico', '111': 'Qatar', '146': 'Reunion', '32': 'Romania', '140': 'Rwanda', '134': 'Saint Kitts and Nevis', '164': 'Saint Lucia', '166': 'Saint Vincent and the Grenadines', '198': 'Samoa', '178': 'Sao Tome and Principe', '53': 'Saudi Arabia', '61': 'Senegal', '29': 'Serbia', '184': 'Seychelles', '115': 'Sierra Leone', '196': 'Singapore', '141': 'Slovakia', '59': 'Slovenia', '193': 'Solomon Islands', '149': 'Somalia', '31': 'South Africa', '177': 'South Sudan', '56': 'Spain', '64': 'Sri Lanka', '98': 'Sudan', '142': 'Suriname', '106': 'Eswatini', '46': 'Sweden', '173': 'Switzerland', '110': 'Syria', '55': 'Taiwan', '143': 'Tajikistan', '9': 'Tanzania', '52': 'Thailand', '91': 'Timor-Leste', '99': 'Togo', '197': 'Tonga', '104': 'Trinidad and Tobago', '89': 'Tunisia', '62': 'Turkey', '161': 'Turkmenistan', '75': 'Uganda', '1': 'Ukraine', '95': 'United Arab Emirates', '16': 'United Kingdom', '187': 'United States', '156': 'Uruguay', '40': 'Uzbekistan', '70': 'Venezuela', '10': 'Vietnam', '30': 'Yemen', '147': 'Zambia', '96': 'Zimbabwe'
  };

  const countryCodeToIso: Record<string, string> = { '74': 'AF', '155': 'AL', '58': 'DZ', '76': 'AO', '181': 'AI', '169': 'AG', '39': 'AR', '148': 'AM', '179': 'AW', '175': 'AU', '50': 'AT', '35': 'AZ', '122': 'BS', '145': 'BH', '60': 'BD', '118': 'BB', '51': 'BY', '82': 'BE', '124': 'BZ', '120': 'BJ', '195': 'BM', '158': 'BT', '92': 'BO', '108': 'BA', '123': 'BW', '73': 'BR', '121': 'BN', '83': 'BG', '152': 'BF', '119': 'BI', '24': 'KH', '41': 'CM', '36': 'CA', '186': 'CV', '170': 'KY', '125': 'CF', '42': 'TD', '151': 'CL', '3': 'CN', '33': 'CO', '133': 'KM', '150': 'CD', '18': 'CG', '93': 'CR', '27': 'CI', '45': 'HR', '113': 'CU', '77': 'CY', '63': 'CZ', '172': 'DK', '168': 'DJ', '126': 'DM', '109': 'DO', '105': 'EC', '21': 'EG', '101': 'SV', '167': 'GQ', '176': 'ER', '34': 'EE', '71': 'ET', '189': 'FJ', '163': 'FI', '78': 'FR', '162': 'GF', '154': 'GA', '28': 'GM', '128': 'GE', '43': 'DE', '38': 'GH', '201': 'GI', '129': 'GR', '127': 'GD', '160': 'GP', '94': 'GT', '68': 'GN', '130': 'GW', '131': 'GY', '26': 'HT', '88': 'HN', '14': 'HK', '84': 'HU', '132': 'IS', '22': 'IN', '6': 'ID', '57': 'IR', '47': 'IQ', '23': 'IE', '13': 'IL', '86': 'IT', '103': 'JM', '182': 'JP', '116': 'JO', '2': 'KZ', '8': 'KE', '190': 'KR', '203': 'XK', '100': 'KW', '11': 'KG', '25': 'LA', '49': 'LV', '153': 'LB', '136': 'LS', '135': 'LR', '102': 'LY', '44': 'LT', '165': 'LU', '20': 'MO', '183': 'MK', '17': 'MG', '137': 'MW', '7': 'MY', '159': 'MV', '69': 'ML', '199': 'MT', '114': 'MR', '157': 'MU', '54': 'MX', '85': 'MD', '144': 'MC', '72': 'MN', '171': 'ME', '180': 'MS', '37': 'MA', '80': 'MZ', '5': 'MM', '138': 'NA', '81': 'NP', '48': 'NL', '185': 'NC', '67': 'NZ', '90': 'NI', '139': 'NE', '19': 'NG', '174': 'NO', '107': 'OM', '66': 'PK', '188': 'PS', '112': 'PA', '79': 'PG', '87': 'PY', '65': 'PE', '4': 'PH', '15': 'PL', '117': 'PT', '97': 'PR', '111': 'QA', '146': 'RE', '32': 'RO', '140': 'RW', '134': 'KN', '164': 'LC', '166': 'VC', '198': 'WS', '178': 'ST', '53': 'SA', '61': 'SN', '29': 'RS', '184': 'SC', '115': 'SL', '196': 'SG', '141': 'SK', '59': 'SI', '193': 'SB', '149': 'SO', '31': 'ZA', '177': 'SS', '56': 'ES', '64': 'LK', '98': 'SD', '142': 'SR', '106': 'SZ', '46': 'SE', '173': 'CH', '110': 'SY', '55': 'TW', '143': 'TJ', '9': 'TZ', '52': 'TH', '91': 'TL', '99': 'TG', '197': 'TO', '104': 'TT', '89': 'TN', '62': 'TR', '161': 'TM', '75': 'UG', '1': 'UA', '95': 'AE', '16': 'GB', '187': 'US', '156': 'UY', '40': 'UZ', '70': 'VE', '10': 'VN', '30': 'YE', '147': 'ZM', '96': 'ZW' };

  const serviceDetails: Record<string, { name: string; icon: React.ReactNode; popular?: boolean }> = {
    wa: { name: 'WhatsApp', icon: <FaWhatsapp className="text-green-500 m-[auto]" />, popular: true },
    tg: { name: 'Telegram', icon: <FaTelegramPlane className="text-blue-400 m-[auto]" />, popular: true },
    ig: { name: 'Instagram', icon: <FaInstagram className="text-pink-500 m-[auto]" />, popular: false },
    tw: { name: 'Twitter', icon: <FaTwitter className="text-blue-500 m-[auto]" />, popular: true },
    fb: { name: 'Facebook', icon: <FaFacebook className="text-blue-700 m-[auto]" />, popular: false },
    go: { name: 'Google', icon: <FaGoogle className="text-red-500 m-[auto]" />, popular: true },
    am: { name: 'Amazon', icon: <FaAmazon className="text-yellow-600 m-[auto]" />, popular: false },
    dc: { name: 'Discord', icon: <FaDiscord className="text-indigo-500 m-[auto]" />, popular: false },
    vi: { name: 'Viber', icon: <Phone className="text-purple-500 m-[auto]" />, popular: false },
    sg: { name: 'Signal', icon: <MessageSquare className="text-blue-600 m-[auto]" />, popular: false },
    li: { name: 'LinkedIn', icon: <Linkedin className="text-blue-800 m-[auto]" />, popular: false },
  };

  // Hardcoded rental plans data
  const rentalPlans = [
    {
      id: 'basic-7',
      name: '7 Days Basic',
      duration: '7 days',
      price: '15.99',
      features: ['Unlimited SMS', 'Voice calls', 'Basic support'],
      popular: false,
      countries: ['US', 'UK', 'CA', 'AU'],
      icon: <Calendar className="text-blue-500 m-[auto]" />
    },
    {
      id: 'premium-30',
      name: '30 Days Premium',
      duration: '30 days',
      price: '49.99',
      features: ['Unlimited SMS', 'Voice calls', 'Priority support', 'Multiple numbers'],
      popular: true,
      countries: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'],
      icon: <Star className="text-yellow-500 m-[auto]" />
    },
    {
      id: 'business-90',
      name: '90 Days Business',
      duration: '90 days',
      price: '129.99',
      features: ['Unlimited SMS', 'Voice calls', '24/7 support', 'API access', 'Bulk operations'],
      popular: false,
      countries: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG'],
      icon: <Shield className="text-green-500 m-[auto]" />
    },
    {
      id: 'enterprise-365',
      name: '1 Year Enterprise',
      duration: '365 days',
      price: '399.99',
      features: ['Everything included', 'Dedicated support', 'Custom integrations', 'White-label'],
      popular: false,
      countries: ['Global coverage'],
      icon: <Globe className="text-purple-500 m-[auto]" />
    }
  ];

  // Hardcoded eSIM plans data
  const esimPlans = [
    {
      id: 'travel-1gb',
      name: 'Travel Starter',
      data: '1GB',
      duration: '7 days',
      price: '9.99',
      countries: ['US', 'UK', 'EU'],
      features: ['High-speed data', 'Instant activation', 'No roaming fees'],
      popular: false,
      icon: <Wifi className="text-blue-500 m-[auto]" />
    },
    {
      id: 'global-5gb',
      name: 'Global Explorer',
      data: '5GB',
      duration: '30 days',
      price: '29.99',
      countries: ['100+ countries'],
      features: ['5G speed', 'Hotspot sharing', 'Multi-country', 'eSIM profile'],
      popular: true,
      icon: <Globe className="text-green-500 m-[auto]" />
    },
    {
      id: 'business-10gb',
      name: 'Business Pro',
      data: '10GB',
      duration: '30 days',
      price: '49.99',
      countries: ['Global coverage'],
      features: ['Priority network', 'Business support', 'Expense reporting', 'Team management'],
      popular: false,
      icon: <CreditCard className="text-purple-500 m-[auto]" />
    },
    {
      id: 'unlimited-monthly',
      name: 'Unlimited Monthly',
      data: 'Unlimited',
      duration: '30 days',
      price: '79.99',
      countries: ['US', 'CA', 'EU', 'UK'],
      features: ['Truly unlimited', 'No throttling', 'Premium support', '5G access'],
      popular: false,
      icon: <Zap className="text-yellow-500 m-[auto]" />
    }
  ];

  // Hardcoded countries for rentals
  const rentalCountries = [
    { id: 'US', name: 'United States', flag: '🇺🇸', price: '15.99', popular: true },
    { id: 'UK', name: 'United Kingdom', flag: '🇬🇧', price: '12.99', popular: true },
    { id: 'CA', name: 'Canada', flag: '🇨🇦', price: '14.99', popular: false },
    { id: 'AU', name: 'Australia', flag: '🇦🇺', price: '16.99', popular: false },
    { id: 'DE', name: 'Germany', flag: '🇩🇪', price: '11.99', popular: true },
    { id: 'FR', name: 'France', flag: '🇫🇷', price: '11.99', popular: false },
    { id: 'JP', name: 'Japan', flag: '🇯🇵', price: '18.99', popular: false },
    { id: 'SG', name: 'Singapore', flag: '🇸🇬', price: '13.99', popular: false },
    { id: 'NL', name: 'Netherlands', flag: '🇳🇱', price: '10.99', popular: false },
    { id: 'SE', name: 'Sweden', flag: '🇸🇪', price: '12.99', popular: false }
  ];

  // Hardcoded countries for eSIMs
  const esimCountries = [
    { id: 'US', name: 'United States', flag: '🇺🇸', price: '9.99', popular: true },
    { id: 'UK', name: 'United Kingdom', flag: '🇬🇧', price: '8.99', popular: true },
    { id: 'EU', name: 'European Union', flag: '🇪🇺', price: '12.99', popular: true },
    { id: 'CA', name: 'Canada', flag: '🇨🇦', price: '11.99', popular: false },
    { id: 'AU', name: 'Australia', flag: '🇦🇺', price: '13.99', popular: false },
    { id: 'JP', name: 'Japan', flag: '🇯🇵', price: '15.99', popular: false },
    { id: 'KR', name: 'South Korea', flag: '🇰🇷', price: '14.99', popular: false },
    { id: 'SG', name: 'Singapore', flag: '🇸🇬', price: '10.99', popular: false },
    { id: 'TH', name: 'Thailand', flag: '🇹🇭', price: '7.99', popular: false },
    { id: 'IN', name: 'India', flag: '🇮🇳', price: '6.99', popular: true }
  ];

  const getFlagEmoji = (countryCode: string) => {
    return String.fromCodePoint(...[...countryCode.toUpperCase()].map(char => 0x1F1A5 + char.charCodeAt(0)));
  }

  // Generate countries from API data
  const countries = useMemo(() => {
    if (!prices) return [];
    return Object.keys(prices)
      .map(code => {
        const countryServices = prices[code];
        const totalNumbers = Object.values(countryServices).reduce((sum: number, service: any) => sum + service.count, 0);
        const minPrice = Math.min(...Object.values(countryServices).map((service: any) => service.cost));
        const isPopular = totalNumbers > 50 || ['1', '16', '187', '22'].includes(code); // Ukraine, UK, US, India

        return {
          id: code,
          name: countryNames[code] || `Unknown Country (${code})`,
          flag: getFlagEmoji(countryCodeToIso[code] || 'XX'),
          price: `$${minPrice.toFixed(2)}`,
          numbers: totalNumbers.toLocaleString(),
          popular: isPopular
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [prices, countryNames, countryCodeToIso]);

  // Generate services based on selected country
  const services = useMemo(() => {
    if (!selectedCountry || !prices) {
      // Show all possible services when no country selected
      return Object.entries(serviceDetails).map(([code, details]) => ({
        id: code,
        name: details.name,
        icon: details.icon,
        price: "$0.25", // Default price
        popular: details.popular || false
      }));
    }

    const countryServices = prices[selectedCountry];
    if (!countryServices) return [];

    return Object.entries(countryServices).map(([code, serviceData]) => ({
      id: code,
      name: serviceDetails[code]?.name || code,
      icon: serviceDetails[code]?.icon || <Smartphone className="text-gray-500 m-[auto]" />,
      price: `$${serviceData.cost.toFixed(2)}`,
      popular: serviceDetails[code]?.popular || false
    }));
  }, [selectedCountry, prices, serviceDetails]);

  // Handle service selection - navigate to login if both country and service selected
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    if (selectedCountry && serviceId) {
      // Navigate to login page when both country and service are selected
      navigate('/auth/login');
    }
  };

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
                    {activeTab === 'sms' && 'SMS Deliveries'}
                    {activeTab === 'rentals' && 'Number Rentals'}
                    {activeTab === 'esims' && 'eSIM Plans'}
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
                  {/* SMS Tab Content */}
                  {activeTab === 'sms' && (
                    <>
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
                    </>
                  )}

                  {/* Rentals Tab Content */}
                  {activeTab === 'rentals' && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <span className="text-sm font-semibold">Select rental plan</span>
                        </div>

                        {selectedRentalPlan && (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl border border-secondary/20 animate-slide-up">
                            <span className="text-2xl">{rentalPlans.find(p => p.id === selectedRentalPlan)?.icon}</span>
                            <div className="flex-1">
                              <span className="text-sm font-semibold block">{rentalPlans.find(p => p.id === selectedRentalPlan)?.name}</span>
                              <span className="text-xs text-muted-foreground">Selected Plan</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setSelectedRentalPlan("")}
                            >
                              ❌
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <span className="text-sm font-semibold">Select country</span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                          {rentalCountries.map((country, index) => (
                            <div
                              key={country.id}
                              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${selectedCountry === country.id
                                ? 'border-secondary bg-gradient-to-r from-secondary/10 to-primary/10 shadow-glow'
                                : 'border-border hover:border-secondary/30 hover:bg-gradient-to-r hover:from-secondary/5 hover:to-primary/5'
                                }`}
                              onClick={() => setSelectedCountry(country.id)}
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
                                    <span className="text-xs text-success font-medium">Available</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-secondary">from ${country.price}</div>
                                  <div className="text-xs text-muted-foreground">per month</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* eSIMs Tab Content */}
                  {activeTab === 'esims' && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <span className="text-sm font-semibold">Select eSIM plan</span>
                        </div>

                        {selectedEsimPlan && (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20 animate-slide-up">
                            <span className="text-2xl">{esimPlans.find(p => p.id === selectedEsimPlan)?.icon}</span>
                            <div className="flex-1">
                              <span className="text-sm font-semibold block">{esimPlans.find(p => p.id === selectedEsimPlan)?.name}</span>
                              <span className="text-xs text-muted-foreground">Selected eSIM</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setSelectedEsimPlan("")}
                            >
                              ❌
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <span className="text-sm font-semibold">Select country</span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                          {esimCountries.map((country, index) => (
                            <div
                              key={country.id}
                              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${selectedCountry === country.id
                                ? 'border-green-500 bg-gradient-to-r from-green-500/10 to-blue-500/10 shadow-glow'
                                : 'border-border hover:border-green-500/30 hover:bg-gradient-to-r hover:from-green-500/5 hover:to-blue-500/5'
                                }`}
                              onClick={() => setSelectedCountry(country.id)}
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
                                    <span className="text-xs text-success font-medium">Available</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">from ${country.price}</div>
                                  <div className="text-xs text-muted-foreground">per plan</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Country Selection - Only for SMS tab */}
                  {activeTab === 'sms' && (
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
                            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${selectedCountry === country.id
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
                  )}

                  {/* Action Buttons */}
                  {/* SMS Action Button */}
                  {activeTab === 'sms' && selectedService && selectedCountry && (
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
                        onClick={() => navigate('/auth/login')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Get Number - ${countries.find(c => c.id === selectedCountry)?.price}
                        <Zap className="h-4 w-4 ml-2 group-hover:animate-pulse" />
                      </Button>
                    </div>
                  )}

                  {/* Rentals Action Button */}
                  {activeTab === 'rentals' && selectedRentalPlan && (
                    <div className="space-y-3 animate-slide-up">
                      <div className="p-4 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl border border-secondary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-semibold">Ready to rent</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rentalPlans.find(p => p.id === selectedRentalPlan)?.name} • {rentalPlans.find(p => p.id === selectedRentalPlan)?.duration}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-glow transition-all duration-300 group"
                        size="lg"
                        onClick={() => navigate('/auth/login')}
                      >
                        <Repeat className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Rent Number - ${rentalPlans.find(p => p.id === selectedRentalPlan)?.price}
                        <Calendar className="h-4 w-4 ml-2 group-hover:animate-pulse" />
                      </Button>
                    </div>
                  )}

                  {/* eSIMs Action Button */}
                  {activeTab === 'esims' && selectedEsimPlan && (
                    <div className="space-y-3 animate-slide-up">
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-semibold">Ready to activate</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {esimPlans.find(p => p.id === selectedEsimPlan)?.name} • {esimPlans.find(p => p.id === selectedEsimPlan)?.data}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-glow transition-all duration-300 group"
                        size="lg"
                        onClick={() => navigate('/auth/login')}
                      >
                        <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Get eSIM - ${esimPlans.find(p => p.id === selectedEsimPlan)?.price}
                        <Wifi className="h-4 w-4 ml-2 group-hover:animate-pulse" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content with Tabs */}
            <div className="lg:col-span-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="sms" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </TabsTrigger>
                  <TabsTrigger value="rentals" className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Rentals
                  </TabsTrigger>
                  <TabsTrigger value="esims" className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    eSIMs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sms">
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
                            className={`glass border-0 cursor-pointer transition-all duration-300 group hover:shadow-glow hover:-translate-y-1 animate-slide-up ${selectedService === service.id ? 'ring-2 ring-primary shadow-glow' : ''
                              }`}
                            onClick={() => handleServiceSelect(service.id)}
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
                </TabsContent>

                <TabsContent value="rentals">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-lg">
                        <Repeat className="h-5 w-5" />
                      </div>
                      Number Rental Plans
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rentalPlans.map((plan, index) => (
                        <Card
                          key={plan.id}
                          className={`glass border-0 cursor-pointer transition-all duration-300 group hover:shadow-glow hover:-translate-y-1 animate-slide-up ${selectedRentalPlan === plan.id ? 'ring-2 ring-secondary shadow-glow' : ''
                            }`}
                          onClick={() => setSelectedRentalPlan(plan.id)}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardContent className="p-6 relative overflow-hidden">
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{plan.icon}</div>
                              {plan.popular && (
                                <Badge variant="secondary" className="animate-pulse">
                                  🔥 Popular
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                            <p className="text-2xl font-bold text-secondary mb-2">${plan.price}</p>
                            <p className="text-sm text-muted-foreground mb-4">{plan.duration}</p>
                            <div className="space-y-2 mb-4">
                              {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-success" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {plan.countries.map((country, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Rental Info Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      <Card className="glass border-0">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                              <Calendar className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Flexible Rental Periods</CardTitle>
                              <CardDescription>From 7 days to 1 year plans</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Choose from flexible rental periods that suit your needs.
                            All plans include unlimited SMS, voice calls, and dedicated support.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="glass border-0">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Enterprise Features</CardTitle>
                              <CardDescription>API access and bulk operations</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Business and Enterprise plans include API access,
                            bulk operations, and dedicated account management.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="esims">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg">
                        <Wifi className="h-5 w-5" />
                      </div>
                      eSIM Data Plans
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {esimPlans.map((plan, index) => (
                        <Card
                          key={plan.id}
                          className={`glass border-0 cursor-pointer transition-all duration-300 group hover:shadow-glow hover:-translate-y-1 animate-slide-up ${selectedEsimPlan === plan.id ? 'ring-2 ring-green-500 shadow-glow' : ''
                            }`}
                          onClick={() => setSelectedEsimPlan(plan.id)}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardContent className="p-6 relative overflow-hidden">
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{plan.icon}</div>
                              {plan.popular && (
                                <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">
                                  🔥 Popular
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                            <p className="text-2xl font-bold text-green-600 mb-2">${plan.price}</p>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1">
                                <Signal className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">{plan.data}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-muted-foreground">{plan.duration}</span>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-success" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {plan.countries.map((country, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* eSIM Info Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      <Card className="glass border-0">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                              <Download className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Instant Activation</CardTitle>
                              <CardDescription>Download and activate in seconds</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Get your eSIM instantly via QR code or direct download.
                            No physical SIM card needed - activate within seconds.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="glass border-0">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Globe className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Global Coverage</CardTitle>
                              <CardDescription>100+ countries supported</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Stay connected worldwide with our global eSIM plans.
                            High-speed 5G data in over 100 countries.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Services
// import { useState } from "react"
// import { useState, useMemo } from "react"
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Smartphone,
  Plus,
  Calendar,
  MapPin,
  MoreVertical,
  Copy,
  RefreshCw,
  Trash2,
  MessageSquare,
  Check,
  AlertTriangle,
  Loader2,
  Send,
  Instagram,
  Twitter,
  Facebook,
  Signal,
  Phone,
  Linkedin,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTigerSmsPrices } from "@/hooks/useTigerSmsPrices";
import { getNumber, setStatus, getStatus } from "@/lib/tiger-sms-api";
const MyNumbers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  interface Number {
    id: number;
    number: string;
    activationId?: string; // Add activationId for API interactions
    country: string;
    countryCode: string;
    type: string;
    status: string;
    expires: string;
    messagesCount: number;
    lastUsed: string;
    services: string[];
  }
  const [numbers, setNumbers] = useState<Number[]>(() => {
    try {
      const storedNumbers = window.localStorage.getItem('myVirtualNumbers');
      return storedNumbers ? JSON.parse(storedNumbers) : [];
    } catch (error) {
      console.error("Error reading numbers from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('myVirtualNumbers', JSON.stringify(numbers));
    } catch (error) {
      console.error("Error writing numbers to localStorage", error);
    }
  }, [numbers]);

  const filteredNumbers = numbers.filter(number =>
    number.number.includes(searchTerm) ||
    number.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Rental":
        return "bg-primary text-primary-foreground"
      case "Temporary":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  // Modal State
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Country, 2: Service
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ status: 'success' | 'error'; message: string; number?: string } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Modal state for messages
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<string[]>([]);
  const [currentNumber, setCurrentNumber] = useState<Number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);

  // Fetch live pricing data
  const { prices, loading: pricesLoading, error: pricesError } = useTigerSmsPrices();

  // Mappings for API data to UI-friendly names and icons
  const countryNames: Record<string, string> = {
    '74': 'Afghanistan',
    '155': 'Albania',
    '58': 'Algeria',
    '76': 'Angola',
    '181': 'Anguilla',
    '169': 'Antigua and Barbuda',
    '39': 'Argentina',
    '148': 'Armenia',
    '179': 'Aruba',
    '175': 'Australia',
    '50': 'Austria',
    '35': 'Azerbaijan',
    '122': 'Bahamas',
    '145': 'Bahrain',
    '60': 'Bangladesh',
    '118': 'Barbados',
    '51': 'Belarus',
    '82': 'Belgium',
    '124': 'Belize',
    '120': 'Benin',
    '195': 'Bermuda',
    '158': 'Bhutan',
    '92': 'Bolivia',
    '108': 'Bosnia and Herzegovina',
    '123': 'Botswana',
    '73': 'Brazil',
    '121': 'Brunei Darussalam',
    '83': 'Bulgaria',
    '152': 'Burkina Faso',
    '119': 'Burundi',
    '24': 'Cambodia',
    '41': 'Cameroon',
    '36': 'Canada',
    '186': 'Cape Verde',
    '170': 'Cayman Islands',
    '125': 'Central African Republic',
    '42': 'Chad',
    '151': 'Chile',
    '3': 'China',
    '33': 'Colombia',
    '133': 'Comoros',
    '150': 'Congo (Dem. Republic)',
    '18': 'Congo',
    '93': 'Costa Rica',
    '27': "Côte d'Ivoire",
    '45': 'Croatia',
    '113': 'Cuba',
    '77': 'Cyprus',
    '63': 'Czech Republic',
    '172': 'Denmark',
    '168': 'Djibouti',
    '126': 'Dominica',
    '109': 'Dominican Republic',
    '105': 'Ecuador',
    '21': 'Egypt',
    '101': 'El Salvador',
    '167': 'Equatorial Guinea',
    '176': 'Eritrea',
    '34': 'Estonia',
    '71': 'Ethiopia',
    '189': 'Fiji',
    '163': 'Finland',
    '78': 'France',
    '162': 'French Guiana',
    '154': 'Gabon',
    '28': 'Gambia',
    '128': 'Georgia',
    '43': 'Germany',
    '38': 'Ghana',
    '201': 'Gibraltar',
    '129': 'Greece',
    '127': 'Grenada',
    '160': 'Guadeloupe',
    '94': 'Guatemala',
    '68': 'Guinea',
    '130': 'Guinea-Bissau',
    '131': 'Guyana',
    '26': 'Haiti',
    '88': 'Honduras',
    '14': 'Hong Kong',
    '84': 'Hungary',
    '132': 'Iceland',
    '22': 'India',
    '6': 'Indonesia',
    '57': 'Iran',
    '47': 'Iraq',
    '23': 'Ireland',
    '13': 'Israel',
    '86': 'Italy',
    '103': 'Jamaica',
    '182': 'Japan',
    '116': 'Jordan',
    '2': 'Kazakhstan',
    '8': 'Kenya',
    '190': 'Korea',
    '203': 'Kosovo',
    '100': 'Kuwait',
    '11': 'Kyrgyzstan',
    '25': 'Laos',
    '49': 'Latvia',
    '153': 'Lebanon',
    '136': 'Lesotho',
    '135': 'Liberia',
    '102': 'Libya',
    '44': 'Lithuania',
    '165': 'Luxembourg',
    '20': 'Macau',
    '183': 'North Macedonia',
    '17': 'Madagascar',
    '137': 'Malawi',
    '7': 'Malaysia',
    '159': 'Maldives',
    '69': 'Mali',
    '199': 'Malta',
    '114': 'Mauritania',
    '157': 'Mauritius',
    '54': 'Mexico',
    '85': 'Moldova',
    '144': 'Monaco',
    '72': 'Mongolia',
    '171': 'Montenegro',
    '180': 'Montserrat',
    '37': 'Morocco',
    '80': 'Mozambique',
    '5': 'Myanmar',
    '138': 'Namibia',
    '81': 'Nepal',
    '48': 'Netherlands',
    '185': 'New Caledonia',
    '67': 'New Zealand',
    '90': 'Nicaragua',
    '139': 'Niger',
    '19': 'Nigeria',
    '174': 'Norway',
    '107': 'Oman',
    '66': 'Pakistan',
    '188': 'Palestine',
    '112': 'Panama',
    '79': 'Papua New Guinea',
    '87': 'Paraguay',
    '65': 'Peru',
    '4': 'Philippines',
    '15': 'Poland',
    '117': 'Portugal',
    '97': 'Puerto Rico',
    '111': 'Qatar',
    '146': 'Reunion',
    '32': 'Romania',
    '140': 'Rwanda',
    '134': 'Saint Kitts and Nevis',
    '164': 'Saint Lucia',
    '166': 'Saint Vincent and the Grenadines',
    '198': 'Samoa',
    '178': 'Sao Tome and Principe',
    '53': 'Saudi Arabia',
    '61': 'Senegal',
    '29': 'Serbia',
    '184': 'Seychelles',
    '115': 'Sierra Leone',
    '196': 'Singapore',
    '141': 'Slovakia',
    '59': 'Slovenia',
    '193': 'Solomon Islands',
    '149': 'Somalia',
    '31': 'South Africa',
    '177': 'South Sudan',
    '56': 'Spain',
    '64': 'Sri Lanka',
    '98': 'Sudan',
    '142': 'Suriname',
    '106': 'Eswatini',
    '46': 'Sweden',
    '173': 'Switzerland',
    '110': 'Syria',
    '55': 'Taiwan',
    '143': 'Tajikistan',
    '9': 'Tanzania',
    '52': 'Thailand',
    '91': 'Timor-Leste',
    '99': 'Togo',
    '197': 'Tonga',
    '104': 'Trinidad and Tobago',
    '89': 'Tunisia',
    '62': 'Turkey',
    '161': 'Turkmenistan',
    '75': 'Uganda',
    '1': 'Ukraine',
    '95': 'United Arab Emirates',
    '16': 'United Kingdom',
    '187': 'United States',
    '156': 'Uruguay',
    '40': 'Uzbekistan',
    '70': 'Venezuela',
    '10': 'Vietnam',
    '30': 'Yemen',
    '147': 'Zambia',
    '96': 'Zimbabwe'
  };

  const countryCodeToIso: Record<string, string> = { '74': 'AF', '155': 'AL', '58': 'DZ', '76': 'AO', '181': 'AI', '169': 'AG', '39': 'AR', '148': 'AM', '179': 'AW', '175': 'AU', '50': 'AT', '35': 'AZ', '122': 'BS', '145': 'BH', '60': 'BD', '118': 'BB', '51': 'BY', '82': 'BE', '124': 'BZ', '120': 'BJ', '195': 'BM', '158': 'BT', '92': 'BO', '108': 'BA', '123': 'BW', '73': 'BR', '121': 'BN', '83': 'BG', '152': 'BF', '119': 'BI', '24': 'KH', '41': 'CM', '36': 'CA', '186': 'CV', '170': 'KY', '125': 'CF', '42': 'TD', '151': 'CL', '3': 'CN', '33': 'CO', '133': 'KM', '150': 'CD', '18': 'CG', '93': 'CR', '27': 'CI', '45': 'HR', '113': 'CU', '77': 'CY', '63': 'CZ', '172': 'DK', '168': 'DJ', '126': 'DM', '109': 'DO', '105': 'EC', '21': 'EG', '101': 'SV', '167': 'GQ', '176': 'ER', '34': 'EE', '71': 'ET', '189': 'FJ', '163': 'FI', '78': 'FR', '162': 'GF', '154': 'GA', '28': 'GM', '128': 'GE', '43': 'DE', '38': 'GH', '201': 'GI', '129': 'GR', '127': 'GD', '160': 'GP', '94': 'GT', '68': 'GN', '130': 'GW', '131': 'GY', '26': 'HT', '88': 'HN', '14': 'HK', '84': 'HU', '132': 'IS', '22': 'IN', '6': 'ID', '57': 'IR', '47': 'IQ', '23': 'IE', '13': 'IL', '86': 'IT', '103': 'JM', '182': 'JP', '116': 'JO', '2': 'KZ', '8': 'KE', '190': 'KR', '203': 'XK', '100': 'KW', '11': 'KG', '25': 'LA', '49': 'LV', '153': 'LB', '136': 'LS', '135': 'LR', '102': 'LY', '44': 'LT', '165': 'LU', '20': 'MO', '183': 'MK', '17': 'MG', '137': 'MW', '7': 'MY', '159': 'MV', '69': 'ML', '199': 'MT', '114': 'MR', '157': 'MU', '54': 'MX', '85': 'MD', '144': 'MC', '72': 'MN', '171': 'ME', '180': 'MS', '37': 'MA', '80': 'MZ', '5': 'MM', '138': 'NA', '81': 'NP', '48': 'NL', '185': 'NC', '67': 'NZ', '90': 'NI', '139': 'NE', '19': 'NG', '174': 'NO', '107': 'OM', '66': 'PK', '188': 'PS', '112': 'PA', '79': 'PG', '87': 'PY', '65': 'PE', '4': 'PH', '15': 'PL', '117': 'PT', '97': 'PR', '111': 'QA', '146': 'RE', '32': 'RO', '140': 'RW', '134': 'KN', '164': 'LC', '166': 'VC', '198': 'WS', '178': 'ST', '53': 'SA', '61': 'SN', '29': 'RS', '184': 'SC', '115': 'SL', '196': 'SG', '141': 'SK', '59': 'SI', '193': 'SB', '149': 'SO', '31': 'ZA', '177': 'SS', '56': 'ES', '64': 'LK', '98': 'SD', '142': 'SR', '106': 'SZ', '46': 'SE', '173': 'CH', '110': 'SY', '55': 'TW', '143': 'TJ', '9': 'TZ', '52': 'TH', '91': 'TL', '99': 'TG', '197': 'TO', '104': 'TT', '89': 'TN', '62': 'TR', '161': 'TM', '75': 'UG', '1': 'UA', '95': 'AE', '16': 'GB', '187': 'US', '156': 'UY', '40': 'UZ', '70': 'VE', '10': 'VN', '30': 'YE', '147': 'ZM', '96': 'ZW' };

  const serviceDetails: Record<string, { name: string; icon: React.ElementType }> = {
    wa: { name: 'WhatsApp', icon: MessageSquare },
    tg: { name: 'Telegram', icon: Send },
    ig: { name: 'Instagram', icon: Instagram },
    tw: { name: 'Twitter', icon: Twitter },
    fb: { name: 'Facebook', icon: Facebook },
    sg: { name: 'Signal', icon: Signal },
    vi: { name: 'Viber', icon: Phone },
    li: { name: 'LinkedIn', icon: Linkedin },
    // Add other service code mappings as needed
  };

  const availableCountries = useMemo(() => {
    if (!prices) return [];
    return Object.keys(prices)
      .map(code => ({
        code,
        name: countryNames[code] || `Unknown Country (${code})`, // Fallback to code if name not in map
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [prices, countryNames]);

  const filteredCountries = useMemo(() =>
    availableCountries.filter(country =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
    ), [countrySearchTerm, availableCountries]
  );

  const servicesForSelectedCountry = useMemo(() => {
    if (!selectedCountry || !prices) return [];
    const countryServices = prices[selectedCountry.code];
    if (!countryServices) return [];

    return Object.entries(countryServices).map(([code, details]) => ({
      code,
      ...details,
      ...(serviceDetails[code] || { name: code, icon: Smartphone }), // Fallback for unknown services
    }));
  }, [selectedCountry, prices]);

  const getFlagEmoji = (countryCode: string) => {
    // A simple function to convert country code to flag emoji
    return String.fromCodePoint(...[...countryCode.toUpperCase()].map(char => 0x1F1A5 + char.charCodeAt(0)));
  }

  const handleCountrySelect = (country: { code: string; name: string }) => {
    setSelectedCountry(country);
    setStep(2);
  };

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state on close after a small delay to allow animation to finish
      setTimeout(() => {
        setStep(1);
        setSelectedCountry(null);
        setSelectedServices([]);
        setCountrySearchTerm('');
      }, 300);
    }
  };

  const handleGetNumber = async () => {
    if (!selectedCountry || selectedServices.length === 0) return;

    setIsPurchasing(true);
    try {
      const API_KEY = 'BJ93bFKepOfAjB5cELEDaKfDJyE5p9C1';
      const serviceCode = selectedServices[0]; // Using the first selected service
      const countryCode = selectedCountry.code;
      const ref = 'orbit-comm';

      const text = await getNumber(API_KEY, serviceCode, countryCode);
      const parts = text.split(':');

      if (parts[0] === 'ACCESS_NUMBER') {
        const [, activationId, phoneNumber] = parts;
        const newNumber = {
          id: parseInt(activationId, 10), // Use activationId as a unique ID
          activationId: activationId,
          number: `+${phoneNumber}`,
          country: selectedCountry.name,
          countryCode: countryCodeToIso[selectedCountry.code] || 'XX',
          type: 'Temporary',
          status: 'Active',
          expires: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // Expires in 20 mins
          messagesCount: 0,
          lastUsed: 'Just now',
          services: [serviceDetails[serviceCode]?.name || serviceCode]
        };
        setNumbers(prev => [newNumber, ...prev]);
        handleModalClose(false); // Close the purchase modal
        setPurchaseResult({ status: 'success', message: 'Number acquired successfully!', number: `+${phoneNumber}` });
        setIsResultModalOpen(true);
      } else {
        let errorMessage = `Error from API: ${text}`;
        if (text.includes('NO_NUMBERS')) {
          errorMessage = `Sorry, no numbers are available for ${serviceDetails[serviceCode]?.name || serviceCode} in ${selectedCountry.name} at the moment. Please try again later.`;
        }
        handleModalClose(false);
        setPurchaseResult({ status: 'error', message: errorMessage });
        setIsResultModalOpen(true);
      }
    } catch (error: any) {
      handleModalClose(false);
      setPurchaseResult({ status: 'error', message: `Failed to get number: ${error.message}` });
      setIsResultModalOpen(true);
    } finally {
      setIsPurchasing(false);
    }
  };

  const setTigerSmsStatus = async (activationId: string, status: "cancel" | "end") => {
    const API_KEY = 'BJ93bFKepOfAjB5cELEDaKfDJyE5p9C1';
    try {
      // Use your backend proxy to avoid CORS issues
      const text = await setStatus(API_KEY, activationId, status);
      return text; // e.g. ACCESS_CANCEL, ACCESS_END, NO_ACTIVATION, BAD_KEY
    } catch (error: any) {
      console.error(`Error setting status to ${status}:`, error);
      return `ERROR: ${error.message}`;
    }
  };

  // Helper to fetch messages from Tiger-SMS API
  const getTigerSmsMessages = async (activationId: string): Promise<string[]> => {
    const API_KEY = 'BJ93bFKepOfAjB5cELEDaKfDJyE5p9C1';
    try {
      const text = await getStatus(API_KEY, activationId);
      // Example: STATUS_OK:activation_id:number:code
      // Example on wait: STATUS_WAIT_CODE
      const parts = text.split(':');
      if (parts[0] === 'STATUS_OK') {
        // The message is everything after the first colon.
        const message = parts.slice(1).join(':').trim();
        // The API might send multiple messages separated by newlines or commas.
        return message.split(/[\n,]+/).map(msg => msg.trim());
      }
      // If status is not OK (e.g., STATUS_WAIT_CODE), return an empty array
      return [];
    } catch (error) {
      // On fetch error, also return an empty array
      console.error("Error fetching SMS messages:", error);
      // Re-throw to be caught by the polling logic
      throw error;
    }
  };

  // New handler to open the message modal and start polling
  const handleViewMessages = (number: Number) => {
    if (!number.activationId) return; // Cannot view messages without an activation ID

    setCurrentNumber(number);

    // Load any existing messages from localStorage for this activationId
    try {
      const allStoredMessages: Record<string, string[]> = JSON.parse(window.localStorage.getItem('myVirtualMessages') || '{}');
      const messagesForNumber = allStoredMessages[number.activationId] || [];
      setCurrentMessages(messagesForNumber);
    } catch (error) {
      console.error("Error reading messages from localStorage", error);
      setCurrentMessages([]);
    }

    setPollingError(null);
    setMessageModalOpen(true);
  };

  const pollForMessages = async () => {
    if (!currentNumber?.activationId || document.hidden) return false;
    setIsPolling(true);
    setPollingError(null);
    try {
      const messages = await getTigerSmsMessages(currentNumber.activationId);
      if (messages.length > 0) {
        setCurrentMessages(messages);
        setNumbers(prev =>
          prev.map(n => (n.id === currentNumber.id ? { ...n, messagesCount: messages.length } : n))
        );

        // Save new messages to localStorage, associated with the activationId
        try {
          const allStoredMessages: Record<string, string[]> = JSON.parse(window.localStorage.getItem('myVirtualMessages') || '{}');
          allStoredMessages[currentNumber.activationId] = messages;
          window.localStorage.setItem('myVirtualMessages', JSON.stringify(allStoredMessages));
        } catch (error) {
          console.error("Error writing messages to localStorage", error);
        }
        return true; // Indicate success to stop polling
      }
    } catch (e: any) {
      setPollingError(`Error fetching messages: ${e.message}`);
      return true; // Indicate error to stop polling
    } finally {
      setIsPolling(false);
    }
    return false; // Indicate to continue polling
  };

  // New useEffect for polling messages
  useEffect(() => {
    if (!messageModalOpen || !currentNumber?.activationId) {
      return;
    }

    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const startPolling = async () => {
      const shouldStop = await pollForMessages();
      if (shouldStop) return;

      intervalId = setInterval(async () => {
        const shouldStopInterval = await pollForMessages();
        if (shouldStopInterval) {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        }
      }, 5000); // Poll every 5 seconds
    };

    startPolling();
    timeoutId = setTimeout(() => clearInterval(intervalId), 3 * 60 * 1000); // Stop after 3 minutes

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [messageModalOpen, currentNumber]);

  return (
    <DashboardLayout>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Get a New Number</DialogTitle>
            <DialogDescription>
              {step === 1 ? 'Start by selecting a country.' : `Select services for ${selectedCountry?.name}.`}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="px-6 pb-6">
              <Input
                placeholder="Search for a country..."
                value={countrySearchTerm}
                onChange={(e) => setCountrySearchTerm(e.target.value)}
                className="mb-4 glass"
              />
              {pricesLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pricesError ? (
                <div className="flex flex-col justify-center items-center h-[300px] text-center">
                  <p className="text-destructive mb-2">Failed to load countries.</p>
                  <p className="text-muted-foreground text-sm">{pricesError}</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1 pr-4">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="mr-3 text-lg">{getFlagEmoji(countryCodeToIso[country.code] || 'XX')}</span>
                        <span>{country.name}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {step === 2 && selectedCountry && (
            <div className="px-6 pb-6">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
                  {servicesForSelectedCountry.map((service) => (
                    <button
                      key={service.code}
                      onClick={() => service.count > 0 && handleServiceToggle(service.code)}
                      disabled={service.count === 0}
                      className={`relative p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${selectedServices.includes(service.code) ? 'border-primary bg-primary/10 shadow-glow' : 'hover:bg-muted/50'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                    >
                      <service.icon className="h-8 w-8 text-primary" />
                      <div className="text-center">
                        <span className="text-xs font-medium">{service.name}</span>
                        <p className="text-xs text-muted-foreground">
                          ${service.cost.toFixed(2)} ({service.count})
                        </p>
                      </div>
                      {selectedServices.includes(service.code) && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                {/* <Button variant="hero" disabled={selectedServices.length === 0}>
                  Get Number */}
                <Button variant="hero" onClick={handleGetNumber} disabled={selectedServices.length === 0 || isPurchasing}>
                  {isPurchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Get Number'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                  Your new number has been acquired and added to your account.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">Your new number is:</p>
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
                  Purchase Failed
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">{purchaseResult?.message}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Messages Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Awaiting SMS for {currentNumber?.number}</DialogTitle>
            <DialogDescription>Checking for new messages. This can take a few moments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 min-h-[100px] flex flex-col justify-center">
            {isPolling && currentMessages.length === 0 && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for SMS...</span>
              </div>
            )}
            {pollingError && <div className="text-destructive text-center text-sm">{pollingError}</div>}
            {currentMessages.length > 0 ? (
              currentMessages.map((msg, idx) => (
                <div key={idx} className="bg-primary/10 border border-primary/20 rounded p-3 text-center font-mono text-lg tracking-widest">
                  {msg}
                </div>
              ))
            ) : (
              !isPolling && <div className="text-center text-muted-foreground text-sm">No messages received yet.</div>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={pollForMessages} disabled={isPolling}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-space font-bold">My Numbers</h1>
            <p className="text-muted-foreground">Manage your virtual numbers and rental subscriptions</p>
          </div>
          {/* <Button variant="hero" onClick={() => setOpen(true)}> */}
          <Button variant="hero" onClick={() => setOpen(true)} disabled={pricesLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Get New Number
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Numbers</Label>
                <Input
                  id="search"
                  placeholder="Search by number or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="glass">All Types</Button>
                <Button variant="glass">Active Only</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Numbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNumbers.map((number) => (
            <Card key={number.id} className="glass hover:shadow-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <Badge className={getTypeColor(number.type)}>
                    {number.type}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Number
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (number.activationId) {
                          const result = await setTigerSmsStatus(number.activationId, "end");
                          // Optionally update local state if successful
                          if (result.startsWith("ACCESS_END")) {
                            setNumbers(prev =>
                              prev.map(n =>
                                n.id === number.id ? { ...n, status: "Expired" } : n
                              )
                            );
                          } else {
                            alert(`Failed to end: ${result}`);
                          }
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleViewMessages(number)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={async () => {
                        if (number.activationId) {
                          const result = await setTigerSmsStatus(number.activationId, "cancel");
                          // Optionally update local state if successful
                          if (result.startsWith("ACCESS_CANCEL")) {
                            setNumbers(prev => prev.filter(n => n.id !== number.id));
                          } else {
                            alert(`Failed to cancel: ${result}`);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="text-lg font-mono font-bold">{number.number}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {number.country}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(number.status)}>
                    {number.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {number.messagesCount} messages
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(number.expires).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last used:</span>
                    <span>{number.lastUsed}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Services Used:</div>
                  <div className="flex flex-wrap gap-1">
                    {number.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNumbers.length === 0 && (
          <Card className="glass">
            <CardContent className="text-center py-12">
              <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No numbers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get your first virtual number to get started"}
              </p>
              <Button variant="hero" onClick={() => setOpen(true)} disabled={pricesLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Get Your First Number
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyNumbers
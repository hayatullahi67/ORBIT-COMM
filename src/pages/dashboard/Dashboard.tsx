import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { getStoredEsims } from "@/lib/esim-storage"
import { useState, useEffect } from "react"
import {
  Plus,
  MessageSquare,
  Smartphone,
  Globe,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const Dashboard = () => {
  // Dynamic stats state
  const [stats, setStats] = useState({
    messages: 0,
    activeNumbers: 0,
    activeEsims: 0
  });

  // Function to count messages from localStorage
  const countMessages = (): number => {
    try {
      const allStoredMessages: Record<string, string[]> = JSON.parse(
        localStorage.getItem('myVirtualMessages') || '{}'
      );

      // Count total messages across all activation IDs
      return Object.values(allStoredMessages).reduce((total, messages) => {
        return total + messages.length;
      }, 0);
    } catch (error) {
      console.error("Error counting messages:", error);
      return 0;
    }
  };

  // Function to count active numbers from localStorage
  const countActiveNumbers = (): number => {
    try {
      const storedNumbers = localStorage.getItem('myVirtualNumbers');
      if (!storedNumbers) return 0;

      const numbers = JSON.parse(storedNumbers);
      if (!Array.isArray(numbers)) return 0;

      // Count numbers that are not expired
      return numbers.filter(number => {
        // Assuming numbers have a status field or we check expiry
        return number.status !== 'expired' && number.status !== 'cancelled';
      }).length;
    } catch (error) {
      console.error("Error counting active numbers:", error);
      return 0;
    }
  };

  // Function to count active eSIMs
  const countActiveEsims = (): number => {
    try {
      const esims = getStoredEsims();
      return esims.filter(esim => esim.status !== 'Expired').length;
    } catch (error) {
      console.error("Error counting active eSIMs:", error);
      return 0;
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = () => {
      setStats({
        messages: countMessages(),
        activeNumbers: countActiveNumbers(),
        activeEsims: countActiveEsims()
      });
      loadRecentMessages();
      loadActiveRentals();
      loadEsimActivations();
    };

    loadData();

    // Listen for localStorage changes to update data
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events when data is updated within the same tab
    window.addEventListener('localStorageUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
  }, []);
  // State for recent messages, active rentals, and eSIM activations
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [activeRentals, setActiveRentals] = useState<any[]>([]);
  const [esimActivations, setEsimActivations] = useState<any[]>([]);

  // Function to detect service from message content
  const detectService = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('whatsapp')) return 'WhatsApp';
    if (lowerMessage.includes('telegram')) return 'Telegram';
    if (lowerMessage.includes('google')) return 'Google';
    if (lowerMessage.includes('facebook') || lowerMessage.includes('meta')) return 'Facebook';
    if (lowerMessage.includes('twitter') || lowerMessage.includes('x.com')) return 'Twitter';
    if (lowerMessage.includes('instagram')) return 'Instagram';
    if (lowerMessage.includes('tiktok')) return 'TikTok';
    if (lowerMessage.includes('discord')) return 'Discord';
    if (lowerMessage.includes('uber')) return 'Uber';
    if (lowerMessage.includes('lyft')) return 'Lyft';
    if (lowerMessage.includes('amazon')) return 'Amazon';
    if (lowerMessage.includes('netflix')) return 'Netflix';
    if (lowerMessage.includes('spotify')) return 'Spotify';
    if (lowerMessage.includes('paypal')) return 'PayPal';
    if (lowerMessage.includes('verification code') || lowerMessage.includes('verify')) return 'Verification';
    if (lowerMessage.includes('otp') || lowerMessage.includes('one-time')) return 'OTP';

    return 'SMS';
  };

  // Function to format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Function to calculate days until expiry
  const calculateDaysUntilExpiry = (expiryDate: string): string => {
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Expired';
      if (diffDays === 0) return 'Expires today';
      if (diffDays === 1) return 'Expires tomorrow';
      return `in ${diffDays} days`;
    } catch (error) {
      return 'Unknown';
    }
  };

  // Function to load and process recent messages
  const loadRecentMessages = () => {
    try {
      // Get stored messages
      const allStoredMessages: Record<string, string[]> = JSON.parse(
        localStorage.getItem('myVirtualMessages') || '{}'
      );

      // Get stored numbers to map activation IDs to phone numbers
      const storedNumbers = JSON.parse(
        localStorage.getItem('myVirtualNumbers') || '[]'
      );

      // Create a map of activationId to phone number
      const numberMap: Record<string, string> = {};
      storedNumbers.forEach((number: any) => {
        if (number.activationId && number.number) {
          numberMap[number.activationId] = number.number; // Use 'number' field, not 'phoneNumber'
        }
      });

      // Process all messages and create enhanced message objects
      const processedMessages: any[] = [];

      Object.entries(allStoredMessages).forEach(([activationId, messages]) => {
        const phoneNumber = numberMap[activationId] || 'Unknown Number';

        messages.forEach((message, index) => {
          // Use a simple timestamp estimation (newer messages have higher index)
          // In real scenario, you'd want to store actual timestamps
          const estimatedTimestamp = Date.now() - (messages.length - index - 1) * 5 * 60 * 1000; // 5 minutes apart

          processedMessages.push({
            id: `${activationId}_${index}`,
            number: phoneNumber,
            service: detectService(message),
            message: message,
            time: formatTimeAgo(estimatedTimestamp),
            status: 'received',
            timestamp: estimatedTimestamp
          });
        });
      });

      // Sort by timestamp (newest first) and take only the 3 most recent
      const sortedMessages = processedMessages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);

      setRecentMessages(sortedMessages);
    } catch (error) {
      console.error('Error loading recent messages:', error);
      setRecentMessages([]);
    }
  };

  // Function to load active rentals from localStorage
  const loadActiveRentals = () => {
    try {
      const storedNumbers = JSON.parse(
        localStorage.getItem('myVirtualNumbers') || '[]'
      );

      // Filter active numbers and take only the first 2
      const activeNumbers = storedNumbers
        .filter((number: any) => number.status !== 'expired' && number.status !== 'cancelled')
        .slice(0, 2)
        .map((number: any) => ({
          id: number.activationId || number.id,
          number: number.number || 'Unknown Number', // Use 'number' field, not 'phoneNumber'
          country: number.country || 'Unknown Country',
          expires: number.expiryDate ? calculateDaysUntilExpiry(number.expiryDate) : 'Unknown',
          status: 'active'
        }));

      setActiveRentals(activeNumbers);
    } catch (error) {
      console.error('Error loading active rentals:', error);
      setActiveRentals([]);
    }
  };

  // Function to load eSIM activations from localStorage
  const loadEsimActivations = () => {
    try {
      const esims = getStoredEsims();

      // Filter active eSIMs and take only the first 2
      const activeEsims = esims
        .filter(esim => esim.status !== 'Expired')
        .slice(0, 2)
        .map(esim => {
          const daysUntilExpiry = calculateDaysUntilExpiry(esim.expires);
          const isExpiring = daysUntilExpiry.includes('in') && parseInt(daysUntilExpiry) <= 7;

          return {
            id: esim.id,
            plan: esim.name || esim.plan,
            data: esim.dataTotal || 'Unknown',
            expires: daysUntilExpiry,
            status: isExpiring ? 'expiring' : 'active'
          };
        });

      setEsimActivations(activeEsims);
    } catch (error) {
      console.error('Error loading eSIM activations:', error);
      setEsimActivations([]);
    }
  };



  const statsConfig = [
    {
      title: "Messages",
      value: stats.messages.toString(),
      icon: MessageSquare,
      color: "text-primary"
    },
    {
      title: "Active Numbers",
      value: stats.activeNumbers.toString(),
      icon: Smartphone,
      color: "text-secondary"
    },
    {
      title: "eSIMs Active",
      value: stats.activeEsims.toString(),
      icon: Globe,
      color: "text-accent"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-space font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your account overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="hero" asChild>
              <Link to="/dashboard/esims">
                <Plus className="h-4 w-4 mr-2" />
                Buy New eSIMs
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsConfig.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="glass" className="w-full justify-start" asChild>
              <Link to="/dashboard/numbers">
                <Smartphone className="h-4 w-4 mr-2" />
                Rent Virtual Number
              </Link>
            </Button>
            <Button variant="glass" className="w-full justify-start" asChild>
              <Link to="/pricing">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS Verification
              </Link>
            </Button>
            <Button variant="glass" className="w-full justify-start" asChild>
              <Link to="/dashboard/esims">
                <Globe className="h-4 w-4 mr-2" />
                Buy eSIM Plan
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent SMS Messages */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent SMS Messages
            </CardTitle>
            <CardDescription>Latest verification codes and messages</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message, index) => (
                  <div key={message.id}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {message.service}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{message.number}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{message.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.message}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    </div>
                    {index < recentMessages.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">Messages will appear here when you receive SMS</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Rentals */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-secondary" />
                  Active Rentals
                </CardTitle>
                <CardDescription>Your rental numbers</CardDescription>
              </div>
              <Button variant="minimal" asChild>
                <Link to="/dashboard/numbers">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeRentals.length > 0 ? (
                <div className="space-y-3">
                  {activeRentals.map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{rental.number}</p>
                        <p className="text-sm text-muted-foreground">{rental.country}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Active</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{rental.expires}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active rentals</p>
                  <p className="text-sm text-muted-foreground">Rent a virtual number to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* eSIM Activations */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" />
                  eSIM Plans
                </CardTitle>
                <CardDescription>Your active eSIM subscriptions</CardDescription>
              </div>
              <Button variant="minimal" asChild>
                <Link to="/dashboard/esims">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {esimActivations.length > 0 ? (
                <div className="space-y-3">
                  {esimActivations.map((esim) => (
                    <div key={esim.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{esim.plan}</p>
                        <p className="text-sm text-muted-foreground">{esim.data} data</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={esim.status === 'expiring' ? 'destructive' : 'secondary'}>
                          {esim.status === 'expiring' ? (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expiring
                            </>
                          ) : (
                            'Active'
                          )}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{esim.expires}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active eSIMs</p>
                  <p className="text-sm text-muted-foreground">Purchase an eSIM plan to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
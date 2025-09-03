import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { CheckCircle, Smartphone, Globe, MessageSquare, Zap, ArrowRight } from "lucide-react"

const Pricing = () => {
  const [selectedTab, setSelectedTab] = useState("verification")

  const verificationPlans = [
    {
      title: "Pay-As-You-Go",
      price: "From $0.10",
      description: "Perfect for occasional verification needs",
      features: [
        "Instant SMS verification",
        "Temporary numbers (5-30 minutes)",
        "190+ countries available",
        "Real-time dashboard",
        "24/7 support",
        "API access included"
      ],
      badge: "Most Popular",
      variant: "glass" as const,
      countries: ["US", "UK", "DE", "FR", "CA", "AU", "IN", "BR", "JP", "KR"]
    },
    {
      title: "Developer Pro",
      price: "$29/month",
      description: "For developers and businesses",
      features: [
        "Everything in Pay-As-You-Go",
        "Volume discounts (up to 40% off)",
        "Priority number allocation",
        "Webhook integrations",
        "Dedicated support",
        "Custom integrations"
      ],
      badge: "Best for APIs",
      variant: "hero" as const,
      countries: ["All 190+ countries"]
    },
    {
      title: "Enterprise",
      price: "Custom",
      description: "For large scale operations",
      features: [
        "Everything in Developer Pro",
        "Custom pricing & contracts",
        "Dedicated account manager",
        "SLA guarantees",
        "White-label solutions",
        "Custom infrastructure"
      ],
      badge: "Enterprise",
      variant: "gradient" as const,
      countries: ["Global coverage"]
    }
  ]

  const rentalPlans = [
    {
      title: "Basic Rental",
      price: "From $5/month",
      description: "Long-term number rental",
      features: [
        "Private rental number",
        "30-day minimum rental",
        "Unlimited SMS receiving",
        "Multiple service support",
        "Dashboard management",
        "Auto-renewal options"
      ],
      badge: "Popular",
      variant: "glass" as const
    },
    {
      title: "Premium Rental",
      price: "From $15/month",
      description: "Premium numbers with voice",
      features: [
        "Everything in Basic",
        "Voice call receiving",
        "Premium number selection",
        "Call forwarding",
        "Voicemail transcription",
        "Priority support"
      ],
      badge: "Best Value",
      variant: "hero" as const
    },
    {
      title: "Business Rental",
      price: "From $50/month",
      description: "Business-grade rentals",
      features: [
        "Everything in Premium",
        "Multiple numbers per account",
        "Team management",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated support"
      ],
      badge: "Business",
      variant: "gradient" as const
    }
  ]

  const esimPlans = [
    {
      title: "Regional eSIM",
      price: "From $3.50",
      description: "Perfect for regional travel",
      features: [
        "1-30 day validity",
        "1GB - 50GB data options",
        "Regional coverage",
        "Instant activation",
        "No roaming charges",
        "Multiple device support"
      ],
      badge: "Travel",
      variant: "glass" as const
    },
    {
      title: "Global eSIM",
      price: "From $19.99",
      description: "Worldwide connectivity",
      features: [
        "Global coverage (150+ countries)",
        "Up to 100GB data",
        "Voice & SMS included",
        "30-365 day validity",
        "Hotspot sharing",
        "24/7 support"
      ],
      badge: "Most Popular",
      variant: "hero" as const
    },
    {
      title: "Business eSIM",
      price: "Custom",
      description: "For teams and enterprises",
      features: [
        "Everything in Global",
        "Team management portal",
        "Bulk pricing discounts",
        "Usage analytics",
        "Centralized billing",
        "Enterprise support"
      ],
      badge: "Enterprise",
      variant: "gradient" as const
    }
  ]

  const getCurrentPlans = () => {
    switch (selectedTab) {
      case "verification":
        return verificationPlans
      case "rental":
        return rentalPlans
      case "esim":
        return esimPlans
      default:
        return verificationPlans
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-space font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Simple, Transparent
            </span>
            <br />
            <span className="text-foreground">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. No hidden fees, no surprises.
            Start free and scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Tables */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="verification" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">SMS Verification</span>
                <span className="sm:hidden">SMS</span>
              </TabsTrigger>
              <TabsTrigger value="rental" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Number Rental</span>
                <span className="sm:hidden">Rental</span>
              </TabsTrigger>
              <TabsTrigger value="esim" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">eSIM Plans</span>
                <span className="sm:hidden">eSIM</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="verification" className="space-y-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-space font-bold mb-4">SMS Verification Plans</h2>
                <p className="text-muted-foreground">Instant verification codes from 190+ countries</p>
              </div>
            </TabsContent>

            <TabsContent value="rental" className="space-y-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-space font-bold mb-4">Number Rental Plans</h2>
                <p className="text-muted-foreground">Long-term private numbers for extended use</p>
              </div>
            </TabsContent>

            <TabsContent value="esim" className="space-y-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-space font-bold mb-4">eSIM Plans</h2>
                <p className="text-muted-foreground">Global connectivity without physical SIM cards</p>
              </div>
            </TabsContent>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {getCurrentPlans().map((plan, index) => (
                <Card 
                  key={plan.title} 
                  className={`relative overflow-hidden group animate-slide-up ${
                    index === 1 ? 'scale-105 shadow-glow-lg' : ''
                  }`} 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {plan.badge && (
                    <Badge className="absolute top-4 right-4 z-10">
                      {plan.badge}
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <div className="text-3xl font-bold text-primary mb-2">{plan.price}</div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={plan.variant} 
                      className="w-full" 
                      asChild
                    >
                      <Link to="/auth/signup">
                        {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Tabs>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-space font-bold mb-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">VirtualSIM?</span>
            </h2>
            <p className="text-xl text-muted-foreground">Industry-leading features and reliability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Delivery",
                description: "Numbers and codes delivered in under 2 seconds"
              },
              {
                icon: Smartphone,
                title: "190+ Countries",
                description: "Global coverage with premium number quality"
              },
              {
                icon: MessageSquare,
                title: "Real-time SMS",
                description: "Live dashboard updates as messages arrive"
              },
              {
                icon: Globe,
                title: "99.9% Uptime",
                description: "Enterprise-grade infrastructure and reliability"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="glass text-center animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-space font-bold mb-6">
            Ready to Get <span className="bg-gradient-primary bg-clip-text text-transparent">Started?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers and businesses using our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth/signup">
                Start Free Trial
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Pricing
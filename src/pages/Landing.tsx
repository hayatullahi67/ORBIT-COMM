import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroGlobe from "@/components/HeroGlobe"
import CreativeFilter from "@/components/CreativeFilter"
import CreativeHowItWorks from "@/components/CreativeHowItWorks"
import {
  Smartphone,
  MessageSquare,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  TrendingUp,
  ChevronDown,
  Sparkles,
  Rocket
} from "lucide-react"

const Landing = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Virtual Numbers",
      description: "Temporary or rental numbers from 190+ countries for any verification need.",
      color: "text-primary"
    },
    {
      icon: MessageSquare,
      title: "SMS Verification",
      description: "Instant OTP delivery with real-time dashboard viewing and management.",
      color: "text-secondary"
    },
    {
      icon: Globe,
      title: "Global eSIMs",
      description: "Purchase and activate international eSIMs in minutes for seamless connectivity.",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Full anonymity protection with encrypted transactions and secure infrastructure.",
      color: "text-success"
    }
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Choose Service",
      description: "Select your desired service and country from our extensive global network."
    },
    {
      step: "02",
      title: "Get Number/eSIM",
      description: "Receive your virtual number or eSIM activation instantly in your dashboard."
    },
    {
      step: "03",
      title: "Receive SMS",
      description: "All messages appear in real-time in your secure, private dashboard."
    },
    {
      step: "04",
      title: "Verify & Connect",
      description: "Use for verification or stay connected globally with our premium network."
    }
  ]

  const faqs = [
    {
      question: "How fast can I get a virtual number?",
      answer: "Virtual numbers are available instantly after payment. Our automated system assigns numbers in under 5 seconds."
    },
    {
      question: "Can I use this for WhatsApp, Telegram, and Google verification?",
      answer: "Yes! Our platform supports verification for 500+ services including WhatsApp, Telegram, Google, Twitter, Facebook, and many more."
    },
    {
      question: "Which countries are supported?",
      answer: "We support 190+ countries worldwide with high-quality virtual numbers. New countries are added regularly based on demand."
    },
    {
      question: "How does eSIM activation work?",
      answer: "eSIM activation is instant. After purchase, you'll receive a QR code that can be scanned to activate your eSIM on compatible devices."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We use end-to-end encryption, don't store personal data, and all SMS messages are automatically deleted after 7 days."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and popular cryptocurrencies including Bitcoin, Ethereum, and USDT."
    }
  ]

  const stats = [
    { label: "Countries Supported", value: "190+", icon: Globe },
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Average Response Time", value: "<2s", icon: Clock },
    { label: "Success Rate", value: "99.9%", icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden mt-10">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-float" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 animate-bounce">
                <Rocket className="h-3 w-3 mr-1" />
                Revolutionary Communication Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-manrope font-bold mb-6 animate-slide-up leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  247Sim.net
                </span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground/90">
                  Virtual Numbers for Receiving SMS
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl animate-slide-up animate-delay-1">
                For buy virtual mobile number for sms verification you do not need to enter any personal data.
                <span className="text-primary font-semibold">It is enough to register by e-mail.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-slide-up animate-delay-2">
                <Button variant="hero" size="lg" className="group animate-pulse-glow" asChild>
                  <Link to="/services">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Get Virtual Number
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link to="/auth/signup">Create Account</Link>
                </Button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up animate-delay-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="glass rounded-lg p-3 mb-2 group hover:shadow-glow transition-all duration-300">
                        <Icon className="h-5 w-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                        <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3D Globe */}
            <div className="relative">
              <HeroGlobe />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 glass p-2 rounded-lg animate-float">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="absolute top-8 right-8 glass p-2 rounded-lg animate-float delay-1000">
                  <Smartphone className="h-4 w-4 text-secondary" />
                </div>
                <div className="absolute bottom-8 left-8 glass p-2 rounded-lg animate-float delay-2000">
                  <Globe className="h-4 w-4 text-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-manrope font-bold mb-6">
            Over <span className="text-primary">500,000</span> Numbers from <span className="text-primary">180+</span> Countries
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access virtual numbers from around the world for instant SMS verification.
            No personal data required - just register with your email.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/services">Browse All Services</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-manrope font-bold mb-3">
              Everything You Need for
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Global Connectivity</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Powerful features designed for developers, businesses, and individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="glass hover:shadow-glow transition-all duration-300 group animate-slide-up border-0" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-3">
                    <Icon className={`h-6 w-6 ${feature.color} group-hover:scale-110 transition-transform`} />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Creative How It Works */}
      <CreativeHowItWorks />

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-manrope font-bold mb-3">
              Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything you need to know about our services
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass border-0 rounded-lg px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline text-sm sm:text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import SMSFilter from "@/components/SMSFilter"
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
  ChevronDown
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
      
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-xs animate-pulse-glow">
            🚀 Now with Global eSIM Support
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-manrope font-bold mb-4 sm:mb-6 animate-slide-up leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Rent Virtual Numbers,
            </span>
            <br />
            <span className="text-foreground">
              Verify Instantly,
            </span>
            <br />
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Connect Globally
            </span>
          </h1>
          
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto animate-slide-up animate-delay-1">
            Instant SMS verification, rental numbers, and eSIM activation — secure and reliable worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 sm:mb-12 animate-slide-up animate-delay-2">
            <Button variant="hero" size="lg" asChild className="text-sm">
              <Link to="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild className="text-sm">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-slide-up animate-delay-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="glass rounded-lg p-3 sm:p-4">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SMS Filter */}
      <SMSFilter />

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
                <Card key={feature.title} className="glass hover:shadow-glow transition-all duration-300 group animate-slide-up border-0" style={{animationDelay: `${index * 0.1}s`}}>
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

      {/* How It Works */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-manrope font-bold mb-3">
              How It <span className="bg-gradient-secondary bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Get started in under 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="text-center animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base mx-auto">
                    {step.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-6 sm:top-7 left-12 sm:left-14 w-full h-0.5 bg-gradient-to-r from-primary to-transparent opacity-50" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
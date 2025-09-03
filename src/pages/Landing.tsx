import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { 
  Smartphone, 
  MessageSquare, 
  Globe, 
  Shield, 
  Zap, 
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Clock,
  TrendingUp
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

  const plans = [
    {
      title: "Pay-As-You-Go",
      price: "From $0.10",
      description: "Perfect for occasional verification needs",
      features: ["Instant SMS verification", "Temporary numbers", "190+ countries", "Real-time dashboard"],
      badge: "Popular",
      variant: "glass" as const
    },
    {
      title: "Rental Numbers", 
      price: "From $5/month",
      description: "Private numbers for long-term usage",
      features: ["Private rental numbers", "Long-term usage", "Multi-service support", "Priority support"],
      badge: "Best Value",
      variant: "hero" as const
    },
    {
      title: "eSIM Global",
      price: "From $3.50/month", 
      description: "Global connectivity in minutes",
      features: ["Instant eSIM activation", "Voice & Data plans", "Multi-device support", "Global roaming"],
      badge: "New",
      variant: "gradient" as const
    }
  ]

  const testimonials = [
    {
      quote: "This platform is absolutely incredible. The SMS verification is instant and the dashboard is so clean and intuitive.",
      author: "Sarah Chen",
      role: "Startup Founder",
      rating: 5
    },
    {
      quote: "Finally found a reliable service for international numbers. The eSIM feature is a game-changer for our remote team.",
      author: "Marcus Rodriguez", 
      role: "DevOps Engineer",
      rating: 5
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 animate-pulse-glow">
            🚀 Now with Global eSIM Support
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-space font-bold mb-6 animate-slide-up">
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
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up animate-delay-1">
            Instant SMS verification, rental numbers, and eSIM activation — secure and reliable worldwide.
            Join 50,000+ developers and businesses who trust our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up animate-delay-2">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up animate-delay-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="glass rounded-lg p-4">
                  <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-space font-bold mb-4">
              Everything You Need for
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Global Connectivity</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for developers, businesses, and individuals who need reliable communication solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="glass hover:shadow-glow transition-all duration-300 group animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader>
                    <Icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-space font-bold mb-4">
              How It <span className="bg-gradient-secondary bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">Get started in less than 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="text-center animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
                    {step.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-16 w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-space font-bold mb-4">
              Simple, <span className="bg-gradient-primary bg-clip-text text-transparent">Transparent Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground">Choose the perfect plan for your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={plan.title} className={`relative overflow-hidden group animate-slide-up ${index === 1 ? 'scale-105 shadow-glow-lg' : ''}`} style={{animationDelay: `${index * 0.1}s`}}>
                {plan.badge && (
                  <Badge className="absolute top-4 right-4 z-10">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
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
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-space font-bold mb-4">
              Loved by <span className="bg-gradient-secondary bg-clip-text text-transparent">Developers</span>
            </h2>
            <p className="text-xl text-muted-foreground">See what our users are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.author} className="glass animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-4">"{testimonial.quote}"</blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            Join thousands of developers and businesses using our platform for reliable communication solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth/signup">
                Start Free Trial
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
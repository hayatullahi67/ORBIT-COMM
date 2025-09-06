import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MousePointer, 
  Zap, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Timer,
  Shield,
  Globe,
  Smartphone,
  WifiIcon,
  CreditCard
} from "lucide-react"

const CreativeHowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      id: 1,
      title: "Choose Your Service",
      description: "Select from 500+ services with our intelligent recommendation engine",
      icon: MousePointer,
      color: "text-blue-400",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      features: ["AI-Powered Suggestions", "Real-time Availability", "Price Optimization"],
      time: "< 30 seconds"
    },
    {
      id: 2,
      title: "Instant Activation",
      description: "Get your virtual number or eSIM activated in lightning speed",
      icon: Zap,
      color: "text-yellow-400",
      bgGradient: "from-yellow-500/20 to-orange-500/20",
      features: ["Instant Delivery", "Global Coverage", "99.9% Success Rate"],
      time: "< 5 seconds"
    },
    {
      id: 3,
      title: "Receive & Manage",
      description: "Messages arrive in real-time with advanced dashboard features",
      icon: MessageSquare,
      color: "text-green-400",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      features: ["Real-time Notifications", "Message History", "Auto-forwarding"],
      time: "Instant"
    },
    {
      id: 4,
      title: "Verify & Connect",
      description: "Complete verification or stay connected globally with premium quality",
      icon: CheckCircle,
      color: "text-purple-400",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      features: ["Secure Verification", "Global Connectivity", "24/7 Support"],
      time: "Complete"
    }
  ]

  const features = [
    { icon: Timer, label: "2-Second Setup", description: "Fastest in the industry" },
    { icon: Shield, label: "Bank-Grade Security", description: "End-to-end encryption" },
    { icon: Globe, label: "190+ Countries", description: "Global coverage" },
    { icon: Smartphone, label: "Multi-Platform", description: "Works everywhere" },
    { icon: WifiIcon, label: "5G Ready", description: "Future-proof technology" },
    { icon: CreditCard, label: "Instant Payment", description: "Pay & use immediately" }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isVisible, steps.length])

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 animate-bounce">
            ⚡ Revolutionary Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-manrope font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Experience Magic
            </span>
            <br />
            <span className="text-foreground">In Every Step</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our revolutionary process transforms how you get virtual numbers and stay connected
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Steps Visualization */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index
              
              return (
                <Card 
                  key={step.id}
                  className={`transition-all duration-500 cursor-pointer border-0 ${
                    isActive 
                      ? `glass shadow-glow scale-105 bg-gradient-to-r ${step.bgGradient}` 
                      : 'glass hover:shadow-glow-lg'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full bg-gradient-to-br ${step.bgGradient} ${isActive ? 'animate-pulse' : ''}`}>
                        <Icon className={`h-6 w-6 ${step.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{step.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {step.time}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {step.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {index < steps.length - 1 && (
                        <ArrowRight className={`h-5 w-5 transition-colors ${
                          isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'
                        }`} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Why Choose Our <span className="bg-gradient-secondary bg-clip-text text-transparent">Platform?</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div 
                      key={feature.label}
                      className="glass p-4 rounded-xl hover:shadow-glow transition-all duration-300 animate-slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <Icon className="h-8 w-8 text-primary mb-3" />
                      <h4 className="font-semibold text-sm mb-1">{feature.label}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button variant="hero" size="lg" className="animate-pulse-glow">
                <Zap className="h-4 w-4 mr-2" />
                Experience It Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeStep === index 
                    ? 'bg-primary shadow-glow scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreativeHowItWorks
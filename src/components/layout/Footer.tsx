import { Link } from "react-router-dom"
import { Smartphone, Twitter, MessageSquare, Linkedin, Gamepad2 } from "lucide-react"

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "Virtual Numbers", href: "/pricing" },
      { name: "SMS Verification", href: "/pricing" },
      { name: "eSIM Plans", href: "/pricing" },
      { name: "API Documentation", href: "/api-docs" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Affiliate Program", href: "/affiliate" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
    support: [
      { name: "Help Center", href: "/faq" },
      { name: "API Status", href: "/status" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Report Abuse", href: "/contact" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "Telegram", href: "#", icon: MessageSquare },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Discord", href: "#", icon: Gamepad2 },
  ]

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Smartphone className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-space font-bold bg-gradient-primary bg-clip-text text-transparent">
                VirtualSIM
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Instant SMS verification, virtual numbers, and global eSIM activation. 
              Secure, reliable, and available worldwide.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} VirtualSIM. All rights reserved.
          </p>
          <p className="text-muted-foreground mt-4 md:mt-0">
            Made with ❤️ for developers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
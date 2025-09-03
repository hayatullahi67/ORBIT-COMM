import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { 
  Code, 
  Key,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Plus,
  ExternalLink,
  BookOpen,
  Zap,
  BarChart3,
  Shield
} from "lucide-react"

const APIAccess = () => {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)

  const apiKeys = [
    {
      id: 1,
      name: "Production API Key",
      key: "vsk_live_1234567890abcdef1234567890abcdef",
      secret: "vss_live_abcdef1234567890abcdef1234567890",
      status: "active",
      created: "2024-09-01",
      lastUsed: "2024-10-01",
      permissions: ["read", "write"],
      rateLimit: "1000/hour"
    },
    {
      id: 2,
      name: "Development API Key", 
      key: "vsk_test_abcdef1234567890abcdef1234567890",
      secret: "vss_test_1234567890abcdef1234567890abcd",
      status: "active",
      created: "2024-08-15",
      lastUsed: "2024-09-30",
      permissions: ["read"],
      rateLimit: "100/hour"
    }
  ]

  const apiStats = [
    {
      title: "API Calls Today",
      value: "1,247",
      change: "+15.3%",
      icon: Zap
    },
    {
      title: "Success Rate",
      value: "99.8%",
      change: "+0.2%",
      icon: BarChart3
    },
    {
      title: "Rate Limit Used",
      value: "78%",
      change: "+12%",
      icon: Shield
    },
    {
      title: "Active Keys",
      value: "2",
      change: "0",
      icon: Key
    }
  ]

  const codeExamples = {
    curl: `curl -X POST "https://api.virtualsim.app/v1/numbers/rent" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "country": "US",
    "service": "whatsapp",
    "duration": 30
  }'`,
    
    javascript: `const response = await fetch('https://api.virtualsim.app/v1/numbers/rent', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    country: 'US',
    service: 'whatsapp',
    duration: 30
  })
});

const data = await response.json();
console.log(data);`,

    python: `import requests

url = "https://api.virtualsim.app/v1/numbers/rent"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "country": "US",
    "service": "whatsapp", 
    "duration": 30
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,

    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.virtualsim.app/v1/numbers/rent',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode([
    'country' => 'US',
    'service' => 'whatsapp',
    'duration' => 30
  ]),
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`
  }

  const maskKey = (key: string, show: boolean) => {
    if (show) return key
    return key.substring(0, 8) + "..." + key.substring(key.length - 8)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-space font-bold">API Access</h1>
            <p className="text-muted-foreground">Manage your API keys and integrate our services</p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>

        {/* API Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apiStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-success">{stat.change}</p>
                    </div>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Keys */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API authentication keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 bg-muted/20 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{apiKey.name}</h4>
                    <Badge variant={apiKey.status === "active" ? "secondary" : "destructive"}>
                      {apiKey.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">API Key</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={maskKey(apiKey.key, showApiKey)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Secret Key</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={maskKey(apiKey.secret, showSecretKey)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">{new Date(apiKey.created).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Used:</span>
                      <p className="font-medium">{new Date(apiKey.lastUsed).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate Limit:</span>
                      <p className="font-medium">{apiKey.rateLimit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Permissions:</span>
                      <div className="flex gap-1">
                        {apiKey.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="glass" size="sm">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Documentation
              </CardTitle>
              <CardDescription>
                Everything you need to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="glass" className="w-full justify-start" asChild>
                <a href="/api-docs" target="_blank">
                  <BookOpen className="h-4 w-4 mr-2" />
                  API Documentation
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
              
              <Button variant="glass" className="w-full justify-start" asChild>
                <a href="/api-docs/quickstart" target="_blank">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Start Guide
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
              
              <Button variant="glass" className="w-full justify-start" asChild>
                <a href="/api-docs/examples" target="_blank">
                  <Code className="h-4 w-4 mr-2" />
                  Code Examples
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
              
              <Button variant="glass" className="w-full justify-start" asChild>
                <a href="/api-docs/status" target="_blank">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  API Status
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  Our support team is here to help with API integration.
                </p>
                <Button variant="hero" size="sm">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Examples */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Code Examples
            </CardTitle>
            <CardDescription>
              Quick examples to get you started with our API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
              </TabsList>
              
              {Object.entries(codeExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <div className="relative">
                    <pre className="bg-muted/20 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default APIAccess
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { initializePayment } from "@/lib/paystack"
import { getCurrentUser } from "@/lib/auth"
import { CreditCard, DollarSign, Loader2 } from "lucide-react"

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFundsModal = ({ isOpen, onClose, onSuccess }: AddFundsModalProps) => {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const user = getCurrentUser()
  
  const predefinedAmounts = [10, 25, 50, 100, 200, 500]

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString())
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.email) {
      setError("Please log in to add funds")
      return
    }
    
    const amountNum = parseFloat(amount)
    
    if (!amount || isNaN(amountNum) || amountNum < 1) {
      setError("Please enter a valid amount (minimum $1)")
      return
    }
    
    if (amountNum > 10000) {
      setError("Maximum amount is $10,000")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      console.log('🚀 Initializing payment for:', { amount: amountNum, email: user.email })
      
      // Initialize payment with Paystack
      const paymentData = await initializePayment(amountNum, user.email)
      
      console.log('✅ Payment initialized:', paymentData)
      
      // Redirect to Paystack payment page
      if (paymentData.authorization_url) {
        window.location.href = paymentData.authorization_url
      } else {
        throw new Error("No payment URL received")
      }
      
    } catch (error) {
      console.error('❌ Payment initialization error:', error)
      setError(error instanceof Error ? error.message : "Failed to initialize payment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Add Funds to Wallet
          </DialogTitle>
          <DialogDescription>
            Add money to your wallet to purchase virtual numbers and eSIM plans
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Amount Selection */}
          <div className="space-y-3">
            <Label>Quick Select Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedAmounts.map((preAmount) => (
                <Button
                  key={preAmount}
                  type="button"
                  variant={amount === preAmount.toString() ? "hero" : "glass"}
                  size="sm"
                  onClick={() => handleAmountSelect(preAmount)}
                  disabled={isLoading}
                >
                  ${preAmount}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Custom Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Custom Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError("")
                }}
                className="pl-10"
                min="1"
                max="10000"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          {/* Payment Summary */}
          {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
            <div className="bg-muted/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount (USD):</span>
                <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount (NGN):</span>
                <span className="font-medium">₦{(parseFloat(amount) * 800).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Method:</span>
                <span className="font-medium">Paystack (NGN)</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>You'll pay:</span>
                <span className="text-primary">₦{(parseFloat(amount) * 800).toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Rate: $1 = ₦800 (approximate)
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="glass"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={isLoading || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 1}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay with Paystack
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>Secure payment powered by Paystack</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddFundsModal
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConnectKitButton } from "connectkit"
import { useState } from "react"
import { useCreateRequest } from "@/hooks/request-network/use-create-request"
import { useAccount } from "wagmi"
import { parseUnits } from "viem"
import { REQUEST_NETWORK_ADDRESS } from "@/lib/constants"
import { usePayRequest } from "@/hooks/request-network/use-pay-request"

interface DashboardHeaderProps {
  availableCredit: number
  ethExchangeRate: number
  onAddCredit: (amount: number) => void
}

export default function DashboardHeader({
  availableCredit,
  ethExchangeRate,
  onAddCredit,
}: DashboardHeaderProps) {
  const [creditToAdd, setCreditToAdd] = useState("")
  const { address } = useAccount()
  const createRequest = useCreateRequest()
  const payRequest = usePayRequest()

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(creditToAdd)
    
    if (!address) {
      console.error("No wallet connected")
      return
    }

    try {
      const requestId = await createRequest.mutateAsync({
        payerAddress: address,
        receiverAddress: REQUEST_NETWORK_ADDRESS, // Replace with actual receiver address
        amount: parseUnits(amount.toString(), 18).toString(), // Assuming 18 decimals
        reason: "Add credits",
        signer: REQUEST_NETWORK_ADDRESS,
      })
      console.log("Request ID:", requestId)

      const payment = await payRequest.mutateAsync({
        requestId,
      })

      console.log("Payment:", payment)

      onAddCredit(amount)
      setCreditToAdd("")
    } catch (error) {
      console.error("Error creating request:", error)
    }
  }

  return (
    <header className="flex h-[57px] items-center gap-1 border-b bg-background px-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold">Playground</h1>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Credits: {availableCredit.toFixed(2)}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credits</DialogTitle>
                <DialogDescription>
                  Add credits to your account. Current exchange rate: 1 ETH =
                  {ethExchangeRate} credits
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCredit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-credit-dialog">Amount (in credits)</Label>
                  <Input
                    id="add-credit-dialog"
                    type="number"
                    placeholder="Amount"
                    value={creditToAdd}
                    onChange={(e) => setCreditToAdd(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Equivalent:{" "}
                  {creditToAdd
                    ? (parseFloat(creditToAdd) / ethExchangeRate).toFixed(6)
                    : "0"}{" "}
                  ETH
                </div>
                <Button type="submit">
                  <Plus className="size-4 mr-2" />
                  Add Credits
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <ConnectKitButton />
        </div>
      </div>
    </header>
  )
}

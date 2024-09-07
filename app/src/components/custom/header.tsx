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
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit'
import { Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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
  const [isVerified, setIsVerified] = useState(false)
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

      await payRequest.mutateAsync({
        requestId,
      })

      onAddCredit(amount)
      setCreditToAdd("")
    } catch (error) {
      console.error("Error creating request:", error)
    }
  }

  const onSuccess = (proof: ISuccessResult) => {
    console.log("Worldcoin verification successful", proof)
    setIsVerified(true)
    onAddCredit(100) // Add 100 free credits
  }

  const handleVerifyClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent the main button click event
    document.getElementById('worldcoin-verify')?.click()
  }

  return (
    <header className="flex h-[57px] items-center justify-between border-b bg-background px-4">
      <h1 className="text-xl font-semibold">Playground</h1>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                Credits: {availableCredit.toFixed(2)}
                {!isVerified && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 cursor-pointer"
                    onClick={handleVerifyClick}
                  >
                    +100 Free
                  </Badge>
                )}
              </Button>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sm:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => document.getElementById('add-credits-dialog')?.click()}>
              Credits: {availableCredit.toFixed(2)}
            </DropdownMenuItem>
            {!isVerified && (
              <DropdownMenuItem onSelect={() => document.getElementById('worldcoin-verify')?.click()}>
                Get 100 Free Credits
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <ConnectKitButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hidden triggers for mobile menu items */}
      <Dialog>
        <DialogTrigger asChild>
          <button id="add-credits-dialog" className="hidden" />
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

      {!isVerified && (
        <IDKitWidget
          app_id="app_GBkZ1KlVUdFTjeMXKlVUdFT"
          action="claim_nft"
          signal={address}
          onSuccess={onSuccess}
        >
          {({ open }) => <button id="worldcoin-verify" className="hidden" onClick={open} />}
        </IDKitWidget>
      )}
    </header>
  )
}

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
import { REQUEST_NETWORK_ADDRESS, SEI_GOLEM_TOKEN_ADDRESS } from "@/lib/constants"
import { usePayRequest } from "@/hooks/request-network/use-pay-request"
import {
  IDKitWidget,
  ISuccessResult,
  VerificationLevel,
} from "@worldcoin/idkit"
import { Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { env } from "@/env.mjs"
import { useVerifyWithWorldcoin } from "@/hooks/worldcoin/use-verify-worldcoin"
import { useIsVerifiedWithWorldcoin } from "@/hooks/worldcoin/use-is-verified-worldcoin"
import { useAddCredits } from "@/hooks/credit-manager/use-add-credits"
import { useAddLiquidity } from "@/hooks/dragonswap/use-add-liquidity"

interface DashboardHeaderProps {
  availableCredit: number
}

export default function DashboardHeader({
  availableCredit,
}: DashboardHeaderProps) {
  const ethExchangeRate = 100000

  const [creditToAdd, setCreditToAdd] = useState("")
  const { address } = useAccount()
  const { data: isVerified } = useIsVerifiedWithWorldcoin()
  const createRequest = useCreateRequest()
  const payRequest = usePayRequest()
  const verifyWithWorldcoin = useVerifyWithWorldcoin()
  const addCredits = useAddCredits()

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    const creditAmount = parseFloat(creditToAdd)
    const ethAmount = creditAmount / ethExchangeRate

    if (!address) return console.error("No wallet connected")

    try {
      const requestData = await createRequest.mutateAsync({
        payerAddress: address,
        receiverAddress: REQUEST_NETWORK_ADDRESS,
        amount: parseUnits(ethAmount.toFixed(18), 18).toString(),
        reason: "Add credits",
        signer: REQUEST_NETWORK_ADDRESS,
      })

      await payRequest.mutateAsync({
        requestData,
      })

      await addCredits.mutateAsync({
        amount: creditAmount,
      })

      setCreditToAdd("")
    } catch (error) {
      console.error("Error creating request:", error)
    }
  }

  const handleVerifyClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent the main button click event
    document.getElementById("worldcoin-verify")?.click()
  }

  const handleVerify = async (result: ISuccessResult) => {
    try {
      const verifyRes = await verifyWithWorldcoin.mutateAsync({
        proof: result,
        userAddress: address!,
      })
      console.log("Verification response:", verifyRes)
    } catch (error) {
      console.error("Error verifying Worldcoin proof:", error)
    }
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
            <DropdownMenuItem
              onSelect={() =>
                document.getElementById("add-credits-dialog")?.click()
              }
            >
              Credits: {availableCredit.toFixed(2)}
            </DropdownMenuItem>
            {!isVerified && (
              <DropdownMenuItem
                onSelect={() =>
                  document.getElementById("worldcoin-verify")?.click()
                }
              >
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
          app_id={env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`}
          action={env.NEXT_PUBLIC_WORLDCOIN_ACTION}
          onSuccess={() => {}}
          handleVerify={handleVerify}
          verification_level={VerificationLevel.Orb}
        >
          {({ open }) => (
            <button id="worldcoin-verify" className="hidden" onClick={open} />
          )}
        </IDKitWidget>
      )}
    </header>
  )
}

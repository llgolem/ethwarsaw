import {
  payRequest,
} from "@requestnetwork/payment-processor"
import { useMutation } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { RequestNetwork } from "@requestnetwork/request-client.js"

interface UsePayRequestOptions {
  onSuccess?: () => void
}

interface PayRequestVariables {
  requestData: any
}

export const usePayRequest = (options?: UsePayRequestOptions) => {
  const { address } = useAccount()

  return useMutation<void, Error, PayRequestVariables>({
    mutationFn: async ({ requestData }: PayRequestVariables) => {
      if (!address) throw new Error("No address")
      const tx = await payRequest(requestData.inMemoryInfo!.requestData)
      await tx.wait(1)

      const persistingRequestNetwork = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network",
        },
      })

      await persistingRequestNetwork.persistRequest(requestData)

      console.log("Transaction: ", tx)
    },
    onSuccess: options?.onSuccess,
  })
}

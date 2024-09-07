import {
  approveErc20,
  hasErc20Approval,
  hasSufficientFunds,
  payRequest,
} from "@requestnetwork/payment-processor";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { providers } from "ethers";

import { getRequestClient } from "./client";

interface UsePayRequestOptions {
  onSuccess?: () => void;
}

interface PayRequestVariables {
  requestId: string;
}

export const usePayRequest = (options?: UsePayRequestOptions) => {
  const { address } = useAccount();

  return useMutation<void, Error, PayRequestVariables>({
    mutationFn: async ({ requestId }: PayRequestVariables) => {
      if (!address) throw new Error("No address");

      const requestClient = getRequestClient();
      const request = await requestClient.fromRequestId(requestId);
      const requestData = request.getData();

      console.log("Request data: ", requestData);

      // @ts-ignore
      const provider = new providers.Web3Provider(window.ethereum);
      const payerHasSufficientFunds = await hasSufficientFunds({
        request: requestData,
        address,
        providerOptions: {
          provider,
        },
      });

      console.log("Payer has sufficient funds: ", payerHasSufficientFunds);

      const payerHasErc20Approval = await hasErc20Approval(
        requestData,
        address,
        provider
      );
      console.log("Payer has Erc20 approval: ", payerHasErc20Approval);

      if (!payerHasErc20Approval) {
        const approvalTx = await approveErc20(requestData);
        await approvalTx.wait();
      }

      const tx = await payRequest(requestData);

      console.log("Transaction: ", tx);
      await tx.wait();
    },
    onSuccess: options?.onSuccess,
  });
};

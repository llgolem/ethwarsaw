import { Types, Utils } from "@requestnetwork/request-client.js";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { getRequestClient } from "./client";

const network = "sepolia";
const tokenAddress = "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C"; // FAU on sepolia
const zeroAddress = "0x0000000000000000000000000000000000000000";

interface CreateRequestParams {
  payerAddress: string;
  receiverAddress: string;
  amount: string;
  reason: string;
  signer: string;
}

const getCreateRequestParameters = ({
  payerAddress,
  receiverAddress,
  amount,
  reason,
  signer,
}: CreateRequestParams): Types.ICreateRequestParameters => {
  return {
    requestInfo: {
      // The currency in which the request is denominated
      currency: {
        type: Types.RequestLogic.CURRENCY.ERC20,
        value: tokenAddress,
        network: network,
      },

      // The expected amount as a string, in parsed units, respecting `decimals`
      // Consider using `parseUnits()` from ethers or viem
      expectedAmount: amount,

      // The payee identity. Not necessarily the same as the payment recipient.
      payee: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: receiverAddress,
      },

      // The payer identity. If omitted, any identity can pay the request.
      payer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payerAddress,
      },

      // The request creation timestamp.
      timestamp: Utils.getCurrentTimestampInSecond(),
    },

    // The paymentNetwork is the method of payment and related details.
    paymentNetwork: {
      id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
      parameters: {
        paymentNetworkName: network,
        paymentAddress: receiverAddress,
        feeAddress: zeroAddress,
        feeAmount: "0",
      },
    },

    // The contentData can contain anything.
    // Consider using rnf_invoice format from @requestnetwork/data-format
    contentData: {
      reason,
      // dueDate: "2023.06.16",
    },

    // The identity that signs the request, either payee or payer identity.
    signer: {
      type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
      value: signer,
    },
  };
};


export const useCreateRequest = (
  options?: Omit<UseMutationOptions<string, Error, CreateRequestParams>, 'mutationFn'>
) => {
  const { address } = useAccount();

  return useMutation<string, Error, CreateRequestParams>({
    mutationFn: async ({
      amount,
      receiverAddress,
      payerAddress,
      reason,
      signer,
    }) => {
      if (!address) throw new Error("No address");

      const requestCreateParameters = getCreateRequestParameters({
        payerAddress,
        receiverAddress,
        amount,
        reason,
        signer,
      });

      const requestClient = getRequestClient();
      const request = await requestClient.createRequest(
        requestCreateParameters
      );

      console.log(request.requestId);

      return request.requestId;
    },
    ...options
  });
};

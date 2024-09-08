import { Types, Utils } from "@requestnetwork/request-client.js";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getRequestClient } from "./client";
import { env } from "@/env.mjs";

const network = "sepolia";
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
        type: Types.RequestLogic.CURRENCY.ETH,
        value: 'ETH',
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
      id: Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
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
  options?: Omit<UseMutationOptions<any, Error, CreateRequestParams>, 'mutationFn'>
) => {
  return useMutation<any, Error, CreateRequestParams>({
    mutationFn: async ({
      amount,
      receiverAddress,
      payerAddress,
      reason,
      signer,
    }) => {
      const requestCreateParameters = getCreateRequestParameters({
        payerAddress,
        receiverAddress,
        amount,
        reason,
        signer,
      });

      const requestClient = getRequestClient(env.NEXT_PUBLIC_REQUEST_NETWORK_SIGNER);

      const request = await requestClient.createRequest(
        requestCreateParameters
      );

      console.log(request);

      return request;
    },
    ...options
  });
};

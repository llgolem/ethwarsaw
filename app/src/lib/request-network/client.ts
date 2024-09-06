import { RequestNetwork } from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";

export const getRequestClient = () => {
  const web3SignatureProvider = new Web3SignatureProvider(window.ethereum);

  return new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: "https://sepolia.gateway.request.network/",
    },
    signatureProvider: web3SignatureProvider,
  });
};

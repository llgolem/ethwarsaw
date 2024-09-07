import { RequestNetwork } from "@requestnetwork/request-client.js"
import { EthereumPrivateKeySignatureProvider } from "@requestnetwork/epk-signature"
import { Web3SignatureProvider } from "@requestnetwork/web3-signature"

export const getRequestClient = (privateKey?: string) => {
  let signatureProvider

  if (privateKey)
    signatureProvider = new EthereumPrivateKeySignatureProvider({
      method: EthereumPrivateKeySignatureProvider.getMethod(),
      privateKey,
    })
  else signatureProvider = new Web3SignatureProvider(window.ethereum)

  return new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: "https://sepolia.gateway.request.network/",
    },
    signatureProvider,
  })
}

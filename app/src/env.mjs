import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_REQUEST_NETWORK_SIGNER: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      NEXT_PUBLIC_REQUEST_NETWORK_SIGNER:
      process.env.NEXT_PUBLIC_REQUEST_NETWORK_SIGNER,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION &&
    process.env.SKIP_ENV_VALIDATION !== "false" &&
    process.env.SKIP_ENV_VALIDATION !== "0",
})

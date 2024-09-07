// https://stats.golem.network/network/providers/online

// curl http://localhost:11111/v1/chat/completions -H "Content-Type: application/json" -d "{ \"model\": \"llama3.1\", \"messages\": [ { \"role\": \"user\", \"content\": \"What is a Golem Network?\" } ]}"
// curl http://localhost:11111/v1/chat/completions -H "Content-Type: application/json" -d "{ \"model\": \"qwen2:0.5b\", \"messages\": [ { \"role\": \"user\", \"content\": \"What is a Golem Network?\" } ]}"

import {
  GolemNetwork,
  TcpProxy,
  ResourceRental,
  MarketOrderSpec,
  OfferProposal,
} from "@golem-sdk/golem-js";
import { pinoPrettyLogger } from "@golem-sdk/pino-logger";
import { clearInterval } from "node:timers";
import "dotenv/config";

const API_KEY = process.env.API_KEY;
const DEBUG_LEVEL = "info";
const PORT_ON_PROVIDER = 11434;
const PORT_ON_REQUESTOR = 11111;
// const IMAGE_HASH = "23ac8d8f54623ad414d70392e4e3b96da177911b0143339819ec1433"; // ollama with qwen2:0.5b
const IMAGE_HASH = "79675c7e9a967bcd3e58051b92c858c2358d39284a0accd7b6e199cf"; // ollama with llama3.1

const waitFor = async (
  check: () => Promise<boolean>,
  abortSignal: AbortSignal
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const verifyInterval = setInterval(async () => {
      if (abortSignal.aborted) {
        clearInterval(verifyInterval);
        reject(new Error("Operation aborted"));
      } else if (await check()) {
        clearInterval(verifyInterval);
        resolve();
      }
    }, 3000);
  });
};

const splitMultiline = (multiLineStr: string): string[] =>
  multiLineStr
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim());

const myProposalFilter = (proposal: OfferProposal): boolean => {
  console.log(`Evaluating provider: ${proposal.provider.name}`);
  /*
    This filter can be used to engage a provider we used previously.
    It should have the image cached so the deployment will be faster.

    if (proposal.provider.name == "<enter provider name here>") return true;
    else return false;

    pve2m4
    m3
  */
  return true;
};

const glm = new GolemNetwork({
  logger: pinoPrettyLogger({ level: DEBUG_LEVEL }),
  api: { key: API_KEY },
});

const controller = new AbortController();

let proxy: TcpProxy | null = null;
let rental: ResourceRental | null = null;
let isShuttingDown = false;
let serverOnProviderReady = false;

async function main() {
  try {
    await glm.connect();

    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);

    const network = await glm.createNetwork({ ip: "192.168.7.0/24" });

    const order: MarketOrderSpec = {
      demand: {
        workload: {
          imageHash: IMAGE_HASH,
          minMemGib: 16,
          engine: "vm",
        },
      },
      market: {
        rentHours: 5,
        pricing: {
          model: "linear",
          maxStartPrice: 10.0,
          maxCpuPerHourPrice: 10.0,
          maxEnvPerHourPrice: 10.0,
        },
        offerProposalFilter: myProposalFilter,
      },
      network,
    };

    rental = await glm.oneOf({ order, signalOrTimeout: controller.signal });
    const exe = await rental.getExeUnit(controller.signal);

    console.log(`Starting ollama on provider: ${exe.provider.name}`);

    const server = await exe.runAndStream("sleep 1 && /usr/bin/ollama serve");

    server.stdout.subscribe(handleServerOutput);
    server.stderr.subscribe(handleServerError);

    await waitFor(
      () => Promise.resolve(serverOnProviderReady),
      controller.signal
    );

    proxy = exe.createTcpProxy(PORT_ON_PROVIDER);
    proxy.events.on("error", (error) =>
      console.error("TcpProxy reported an error:", error)
    );

    await proxy.listen(PORT_ON_REQUESTOR);
    console.log(
      `Server Proxy listening at http://localhost:${PORT_ON_REQUESTOR}`
    );

    await waitFor(
      () => Promise.resolve(server.isFinished()),
      controller.signal
    );
  } catch (err) {
    console.error("Failed to run the example", err);
  } finally {
    await cleanup();
  }
}

function handleServerOutput(data: unknown) {
  splitMultiline(data as string).forEach((line) =>
    console.log("🟢 $", line)
  );
}

function handleServerError(data: unknown) {
  splitMultiline(data as string).forEach((line) =>
    console.log("🔴 $", line)
  );
  if ((data as string).includes("Listening on [::]:11434")) {
    serverOnProviderReady = true;
  }
}

async function handleShutdown() {
  if (isShuttingDown) {
    console.log("Forced shutdown initiated.");
    process.exit(1);
  }

  console.log("Server shutdown initiated.");
  isShuttingDown = true;
  controller.abort("Shutdown signal received");
  await cleanup();
}

async function cleanup() {
  try {
    await proxy?.close();
    await rental?.stopAndFinalize();
    await glm.disconnect();
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});

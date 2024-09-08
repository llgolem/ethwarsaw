# Golem Network Ollama Integration

This project integrates with the Golem Network to run an Ollama server.

## Prerequisites

1. **Install and run Yagna:**

   - Install Yagna following the [official Golem documentation](https://docs.golem.network/docs/quickstarts/js-quickstart).
   - Run the Yagna service:
     ```
     yagna service run
     ```

2. **Generate Yagna API key:**

   - Run:
     ```
     yagna app-key create requestor
     ```
   - Copy the generated API key.

3. **Set up environment variables:**
   - Create a `.env` file in the project root.
   - Add your Yagna API key:
     ```
     API_KEY=your_generated_api_key_here
     ```

## Installation

Certainly! I'll create documentation for the `src/index.ts` file, including the prerequisites you mentioned. Here's the documentation:

# Golem Network Integration Documentation

This documentation covers the usage of the `src/index.ts` file, which integrates with the Golem Network to run an Ollama server.

## Prerequisites

1. Install and set up Yagna:

   - Install Yagna following the official Golem documentation.
   - Run the Yagna service:
     ```
     yagna service run
     ```

2. Generate Yagna API key:

   - Run the following command to generate an API key:
     ```
     yagna app-key create requestor
     ```
   - Copy the generated API key.

3. Set up environment variables:
   - Create a `.env` file in the project root.
   - Add your Yagna API key to the `.env` file:
     ```
     API_KEY=your_generated_api_key_here
     ```

## Code Overview

The main functionality is implemented in the `src/index.ts` file. Here's an overview of its key components:

1. Configuration:

   - The code uses environment variables for configuration.
   - It sets up constants for debugging, port numbers, and the Ollama image hash.

2. Golem Network Setup:

   - Initializes the Golem Network client.
   - Creates a network for the provider.

3. Provider Selection:

   - Implements a custom proposal filter to select a specific provider.

4. Execution:

   - Runs the Ollama server on the selected provider.
   - Sets up a TCP proxy to forward requests to the Ollama server.

5. Error Handling and Cleanup:
   - Implements error handling and graceful shutdown procedures.

## Usage

To run the Golem Network integration:

1. Ensure all prerequisites are met (Yagna running, API key set in `.env`).
2. Install project dependencies:
   ```
   pnpm install
   ```
3. Run the script:
   ```
   pnpm index
   ```

The script will:

- Connect to the Golem Network
- Select a provider based on the specified criteria
- Start the Ollama server on the provider
- Set up a TCP proxy to forward requests to the Ollama server

You can then interact with the Ollama server through the proxy at `http://localhost:11111`.

## Important Code Sections

1. Golem Network initialization:

```65:68:golem/src/index.ts
const glm = new GolemNetwork({
  logger: pinoPrettyLogger({ level: DEBUG_LEVEL }),
  api: { key: API_KEY },
})
```

2. Provider selection filter:

```47:62:golem/src/index.ts
const myProposalFilter = (proposal: OfferProposal): boolean => {
  console.log(`Evaluating provider: ${proposal.provider.name}`)
  /*
    This filter can be used to engage a provider we used previously.
    It should have the image cached so the deployment will be faster.

    if (proposal.provider.name == "<enter provider name here>") return true;
    else return false;

    pve2m4
    m3
  */
  if (proposal.provider.name == "m2") return true
  else return false

  // return true
```

3. Main execution logic:

```77:137:golem/src/index.ts
async function main() {
  try {
    await glm.connect()

    process.on("SIGINT", handleShutdown)
    process.on("SIGTERM", handleShutdown)

    const network = await glm.createNetwork({ ip: "192.168.7.0/24" })

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
    }

    rental = await glm.oneOf({ order, signalOrTimeout: controller.signal })
    const exe = await rental.getExeUnit(controller.signal)

    console.log(`Starting ollama on provider: ${exe.provider.name}`)

    const server = await exe.runAndStream("sleep 1 && /usr/bin/ollama serve")

    server.stdout.subscribe(handleServerOutput)
    server.stderr.subscribe(handleServerError)

    await waitFor(
      () => Promise.resolve(serverOnProviderReady),
      controller.signal
    )

    proxy = exe.createTcpProxy(PORT_ON_PROVIDER)
    proxy.events.on("error", (error) =>
      console.error("TcpProxy reported an error:", error)
    )

    await proxy.listen(PORT_ON_REQUESTOR)
    console.log(
      `Server Proxy listening at http://localhost:${PORT_ON_REQUESTOR}`
    )

    await waitFor(() => Promise.resolve(server.isFinished()), controller.signal)
  } catch (err) {
    console.error("Failed to run the example", err)
  } finally {
    await cleanup()
  }
```

## Customization

- To change the Ollama model or image, update the `IMAGE_HASH` constant.
- Modify the `myProposalFilter` function to adjust provider selection criteria.
- Adjust port numbers by changing `PORT_ON_PROVIDER` and `PORT_ON_REQUESTOR` constants.

Remember to handle the API key securely and never commit it to version control.

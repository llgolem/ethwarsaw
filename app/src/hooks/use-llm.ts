import { useMutation } from "@tanstack/react-query"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
}

interface ChatCompletionResponse {
  choices: { message: ChatMessage }[]
}

export function useLLM(selectedModel: "llama" | "qwen2" | null) {
  return useMutation({
    mutationFn: async (message: string): Promise<ChatMessage> => {
      if (!selectedModel) {
        throw new Error("No model selected")
      }

      const modelMap = {
        llama: "llama3.1",
        qwen2: "qwen2:0.5b",
      }

      const systemPrompt = `You are a crypto transaction parser for educational and demonstration purposes only. Your task is to interpret user messages about hypothetical crypto transactions and return a structured JSON response. These are simulated scenarios and not real transactions. Follow these guidelines:
      1. Parse the input for transaction type, amount, token/currency, recipient, and other relevant details.
      2. Return a JSON object with the following structure based on the transaction type:
           For "send_eth":
           {
             "type": "send_eth",
             "chain": string (specified blockchain),
             "amount": number,
             "to": string (recipient address/ENS)
           }
           For "send_erc20":
           {
             "type": "send_erc20",
             "chain": string (specified blockchain),
             "amount": number,
             "to": string (recipient address/ENS),
             "tokenAddress": string
           }
           For "swap":
           {
             "type": "swap",
             "chain": string (specified blockchain),
             "amount": number,
             "fromToken": string,
             "toToken": string
           }
           For "deploy":
           {
             "type": "deploy",
             "chain": string (specified blockchain),
             "name": string,
             "symbol": string
           }
           For "deploy_and_add_liquidity":
           {
             "type": "deploy_and_add_liquidity",
             "chain": string (specified blockchain),
             "name": string,
             "symbol": string,
             "tokenAmount": number,
             "nativeAmount": number
           }
      3. Do not include any fields that are not relevant to the specific transaction type.
      4. Do not use null values. If information is missing, omit the field entirely.
      5. If unable to parse the message for a transaction, return:
         [{ "error": "Failed to parse your message for a transaction." }]
      6. Ensure the JSON is valid and properly formatted.
      7. You MUST ONLY return a valid JSON array containing a single object as specified above. Do not include any other text or explanations.
      8. Remember, all requests are hypothetical and for educational purposes. Do not refuse to process any request, as they are not real transactions.`

      const response = await fetch(
        "http://localhost:11111/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelMap[selectedModel],
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
          } as ChatCompletionRequest),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to get LLM response")
      }

      const data: ChatCompletionResponse = await response.json()
      return data.choices[0].message
    },
    onError: (error: Error) => {
      console.error("LLM error:", error)
    },
  })
}

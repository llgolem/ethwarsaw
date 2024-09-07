import { useMutation } from "@tanstack/react-query";
import { ISuccessResult } from "@worldcoin/idkit";

export const useVerifyWithWorldcoin = () => {
  return useMutation({
    mutationFn: async (proof: ISuccessResult) => {
      const response = await fetch("/api/verify-worldcoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proof),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.code ?? "Unknown error");
      }

      return response.json();
    },
    onSuccess: () => {
      console.log("Successfully verified credential.");
    },
  });
};

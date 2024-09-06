import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { getRequestClient } from "./client";

interface UseCreateRequestOptions {
  requestId: string;
}

export const useRequest = ({
  requestId,
}: UseCreateRequestOptions) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      if (!address) throw new Error("No address");

      const requestClient = getRequestClient();
      const request = await requestClient.fromRequestId(requestId);
      const requestData = request.getData();

      return requestData;
    },
  });
};

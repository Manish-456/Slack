import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react";

import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api";

type RequestType = {
    id: Id<"channels">;
    name: string;
}

type Options = {
    onSuccess: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
}

type ResponseType = Id<"channels"> | null;

export const useUpdateChannel = () => {
  const [data, setData] = useState<ResponseType>()  
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"pending" | "error" | "success" | "settled" | null>(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);

  const mutation = useMutation(api.channels.update);

  const mutate = useCallback(
    async(values: RequestType, options: Options) => {
    try {
        setData(null);
        setError(null);
        setStatus("pending");

        const response = await mutation(values);
        options?.onSuccess?.(response);
        setData(response);
        setStatus("success");
        return response;
    } catch (error) {
        setStatus("error");
        options?.onError?.(error as Error)
        setError(error as Error);
        if(options?.throwError){
            throw error;
        }

    }finally {
        setStatus("settled");
        options?.onSettled?.()
  }
  }, [mutation])

  return {
    mutate,
    isPending,
    isSettled,
    isSuccess,
    data,
    isError,
    error
  }
}

import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = {
   memberId: Id<"members">;
    workspaceId: Id<"workspaces">;
};
type ResponseType = Id<"conversations"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError? : (error: Error) => void;
    onSettled?: () => void;
    throwError? : boolean;
}

export const useCreateOrGetConversation = () => {
    const [data, setData] = useState<ResponseType>()
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<"success" | "pending" | "settled" | "error" | null>(null);
    
    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    const mutation = useMutation(api.conversations.createOrGet);

    const mutate = useCallback(async (values: RequestType, options?: Options) => {
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
            setError(error as Error)
            if(options?.throwError){
                throw error;
            }
        }finally {
           setStatus("settled")
            options?.onSettled?.()
        }
    }, [mutation]);

    return {mutate, isPending, isSettled, data, isError, isSuccess, error};
}
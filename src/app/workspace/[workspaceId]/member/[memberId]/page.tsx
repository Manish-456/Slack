"use client";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";

import { Id } from "../../../../../../convex/_generated/dataModel";
import { Conversation } from "./conversation";

export default function MemberPage() {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const { mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    mutate(
      { workspaceId, memberId },
      {
        onSuccess(id) {
          setConversationId(id);
        },
        onError() {
          toast.error("Failed to create or get conversation");
        },
      }
    );
  }, [mutate, workspaceId, memberId]);

  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <AlertTriangle className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }

  return <Conversation id={conversationId} />;
}

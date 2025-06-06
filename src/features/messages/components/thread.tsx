import { toast } from "sonner";
import Quill from "quill";
import { format, differenceInMinutes } from "date-fns";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import { AlertTriangle, Loader, XIcon } from "lucide-react";

import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";

import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGenerateUploadURL } from "@/features/upload/api/use-generate-upload-url";

import { useGetMessage } from "../api/use-get-message";
import { useGetMessages } from "../api/use-get-messages";
import { useCreateMessage } from "../api/use-create-message";

import { Id } from "../../../../convex/_generated/dataModel";
import { cn, formatDateLabel } from "@/lib/utils";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface ThreadProps {
  onClose: () => void;
  messageId: Id<"messages">;
}

type CreateThreadValues = {
  body: string;
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  image?: Id<"_storage">;
};

const TIME_THRESHOLD = 5;

export function Thread({ messageId, onClose }: ThreadProps) {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const editorRef = useRef<Quill | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadURL();
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const { data: message, isLoading: isMessageLoading } = useGetMessage({
    id: messageId,
  });
  const { data: currentMember } = useCurrentMember({
    workspaceId,
  });

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: CreateThreadValues = {
        channelId,
        workspaceId,
        parentMessageId: messageId,
        image: undefined,
        body,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        if (!url) throw new Error("Url not found");

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) throw new Error("Failed to upload image");

        const { storageId } = await result.json();
        values.image = storageId;
      }
      await createMessage(values, {
        throwError: true,
      });
      setEditorKey((prevKey) => prevKey + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (isMessageLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button variant={"ghost"} size={"iconSm"} onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button variant={"ghost"} size={"iconSm"} onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full flex-col gap-y-2 items-center justify-center">
          <AlertTriangle className="size-5 text-rose-500/90" />
          <p className="text-sm text-rose-500/90">Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className={cn(
          "flex justify-between items-center h-[49px] px-4 border-b",
          channelId && "h-[70px]"
        )}
      >
        <p className="text-lg font-bold">Thread</p>
        <Button variant={"ghost"} size={"iconSm"} onClick={onClose}>
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto message-scrollbar">
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-background px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const isCompact =
                prevMessage &&
                prevMessage.user?._id === message.user?._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(prevMessage._creationTime)
                ) < TIME_THRESHOLD;
              return (
                <Message
                  key={message._id}
                  id={message._id}
                  memberId={message.memberId}
                  authorImage={message.user.image}
                  authorName={message.user.name}
                  reactions={message.reactions}
                  body={message.body}
                  image={message.image}
                  createdAt={message._creationTime}
                  updatedAt={message.updatedAt}
                  threadCount={message.threadCount}
                  threadTimestamp={message.threadTimestamp}
                  isEditing={editingId === message._id}
                  setEditingId={setEditingId}
                  threadName={message.threadName}
                  isCompact={isCompact}
                  hideThreadButton
                  isAuthor={message.memberId === currentMember?._id}
                />
              );
            })}
          </div>
        ))}
        <div
          className="h-1"
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                {
                  threshold: 1.0,
                }
              );
              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
        />
        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              <Loader className="size-4 animate-spin" />
            </span>
          </div>
        )}
        <Message
          hideThreadButton
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          body={message.body}
          image={message.image}
          createdAt={message._creationTime}
          updatedAt={message.updatedAt}
          id={message._id}
          reactions={message.reactions}
          setEditingId={setEditingId}
          isEditing={editingId === message._id}
        />
      </div>
      <div className="px-4">
        <Editor
          onSubmit={handleSubmit}
          key={editorKey}
          disabled={isPending}
          innerRef={editorRef}
          placeholder={"Reply..."}
        />
      </div>
    </div>
  );
}

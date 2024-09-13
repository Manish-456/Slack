import React from "react";
import { Button } from "./ui/button";
import {
  MessageSquareTextIcon,
  PencilIcon,
  Smile,
  TrashIcon,
} from "lucide-react";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";

interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  hideThreadButton?: boolean;
  handleReaction: (emoji: string) => void;
}

export function Toolbar({
  isAuthor,
  isPending,
  handleEdit,
  handleDelete,
  handleThread,
  hideThreadButton,
  handleReaction,
}: ToolbarProps) {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-muted  rounded-md shadow-sm">
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelect={(emoji) => handleReaction(emoji.native)}
        >
          <Button variant={"ghost"} disabled={isPending} size={"iconSm"}>
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              variant={"ghost"}
              onClick={handleThread}
              disabled={isPending}
              size={"iconSm"}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit message">
              <Button
                onClick={handleEdit}
                variant={"ghost"}
                disabled={isPending}
                size={"iconSm"}
              >
                <PencilIcon className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete">
              <Button
                variant={"ghost"}
                onClick={handleDelete}
                disabled={isPending}
                size={"iconSm"}
              >
                <TrashIcon className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}

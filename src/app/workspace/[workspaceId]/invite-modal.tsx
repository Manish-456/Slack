import { useState } from "react";
import { CheckCheck, CopyIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-joincode";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}

export function InviteModal({
  open,
  setOpen,
  name,
  joinCode,
}: InviteModalProps) {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will deactivate the current invite code and generate a new one."
  );
  const [copied, setCopied] = useState(false);
  const { mutate, isPending } = useNewJoinCode();
  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;

    navigator.clipboard.writeText(inviteLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleNewCode = async () => {
    const ok = await confirm();
    if (!ok) return;
    mutate(
      {
        workspaceId,
      },
      {
        onSuccess() {
          toast.success("Invite code regenerated");
        },
        onError() {
          toast.error("Failed to generate new code");
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-10 gap-y-4">
            <p className="text-bold text-4xl tracking-widest uppercase">
              {joinCode}
            </p>
            <Button
              type="button"
              variant={"ghost"}
              disabled={copied}
              size={"sm"}
              onClick={handleCopy}
            >
              {copied ? "Copied" : "Copy Link"}
              {!copied ? (
                <CopyIcon className="ml-2 size-4" />
              ) : (
                <CheckCheck className="ml-2 size-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              variant={"outline"}
              onClick={handleNewCode}
            >
              New code
              <RefreshCcw className="size-4 ml-2" />
            </Button>
            <Button disabled={isPending} onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

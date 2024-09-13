import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export function CreateChannelModal() {
  const [name, setName] = useState("");
  const [open, setOpen] = useCreateChannelModal();
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { mutate: createChannel, isPending: isChannelCreating } =
    useCreateChannel();

  const handleClose = () => {
    setName("");
    setOpen(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) return;

    createChannel(
      {
        name,
        workspaceId,
      },
      {
        onSuccess: (id) => {
          handleClose();
          toast.success("Channel created.");
          router.push(`/workspace/${workspaceId}/channel/${id}`);
        },
        onError: () => {
          toast.error("Failed to create channel");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            value={name}
            disabled={isChannelCreating}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="e.g. Project-plan"
          />
          <div className="flex justify-end">
            <Button disabled={isChannelCreating}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

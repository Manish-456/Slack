import { format } from "date-fns";

import { useState } from "react";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface ChannelHeroProps {
  name: string;
  creationTime: number;
  channelDescription?: string;
}

export const ChannelHero = ({
  name,
  creationTime,
  channelDescription,
}: ChannelHeroProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({
    workspaceId,
  });

  const [open, setOpen] = useState(false);
  const channelId = useChannelId();

  const placeholder = channelDescription
    ? channelDescription
    : `This channel is for everything #${name}. Hold meetings, share images, and make decisions together with your team.`;

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();

  const [description, setDescription] = useState(placeholder);

  const handleChange = (value: string) => {
    setDescription(value);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!description.trim()) return;
    updateChannel(
      {
        id: channelId,
        description,
      },
      {
        onSuccess: () => {
          toast.success("Description updated");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update description");
        },
      }
    );
  };
  const onClose = () => {
    setOpen(false);
    setDescription(placeholder);
  };

  const isEmpty = !description.trim();

  return (
    <>
      <div className="mt-[80px] mx-5 mb-4">
        <p className="text-2xl font-bold flex items-center mb-2">#{name}</p>{" "}
        <p className="font-normal text-sm text-white/90 mb-4">{placeholder}</p>
        {currentMember?.role === "admin" && (
          <>
            <button
              className="p-0 underline text-sky-500 mb-2 text-sm"
              onClick={() => setOpen(true)}
            >
              Edit Description
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-[500px] m-0">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Edit Description
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <Textarea
                    placeholder={"Add a description"}
                    value={description}
                    minLength={3}
                    disabled={isUpdatingChannel}
                    maxLength={500}
                    onChange={(e) => handleChange(e.target.value)}
                    required
                  />

                  <p className="text-xs text-muted-foreground">
                    Let people know what this channel is for.
                  </p>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant={"outline"}
                      onClick={onClose}
                      disabled={isUpdatingChannel}
                      size={"sm"}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-500/90"
                      disabled={isUpdatingChannel || isEmpty}
                      size={"sm"}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
        <p className="text-muted-foreground text-xs">
          This channel was created on {format(creationTime, "MMM do, yyyy")}
        </p>
      </div>
    </>
  );
};

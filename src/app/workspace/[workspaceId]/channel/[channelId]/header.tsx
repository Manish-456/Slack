import React, { useState } from "react";
import { MessageCircle, TrashIcon, User2 } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChannelId } from "@/hooks/use-channel-id";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Hint } from "@/components/hint";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this channel?",
    "You are about to delete this channel. This action is irreversible."
  );
  const { data: members } = useGetMembers({ workspaceId });

  const { data: member } = useCurrentMember({ workspaceId });

  const handleOpen = (value: boolean) => {
    if (member?.role !== "admin") return;
    setEditOpen(value);
  };

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();

  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChannel(
      {
        id: channelId,
        name: value,
      },
      {
        onSuccess: () => {
          toast.success(`Channel updated.`);
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to update channel");
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();

    if (!ok) return;

    removeChannel(
      {
        id: channelId,
      },
      {
        onSuccess: () => {
          toast.success("Channel removed");
          router.push(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error("Failed to remove channel");
        },
      }
    );
  };

  const onMemberClick = (memberId: string) => {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/member/${memberId}`);
  };

  return (
    <div className=" border-b h-[70px] pt-2  px-4 overflow-hidden">
      <div className="flex justify-between items-center w-full">
        <ConfirmDialog />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"ghost"}
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
              size={"sm"}
            >
              <span className="truncate"># {title}</span>
              <FaChevronDown className="size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b">
              <DialogTitle># {title}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleOpen}>
                <DialogTrigger asChild>
                  <div className="px-5 py-4 rounded-lg border cursor-pointer hover:bg-gray-50/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Channel name</p>
                      {member?.role === "admin" && (
                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                          Edit
                        </p>
                      )}
                    </div>
                    <p className="text-sm"># {title}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename this channel</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={value}
                      disabled={isUpdatingChannel}
                      onChange={handleChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      placeholder="e.g. Project-plan"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant={"outline"}
                          disabled={isUpdatingChannel}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={isUpdatingChannel}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {member?.role === "admin" && (
                <button
                  onClick={handleRemove}
                  disabled={isRemovingChannel}
                  className="flex items-center gap-x-2 px-5 py-4  rounded-lg cursor-pointer border hover:bg-gray-50/10 text-rose-600"
                >
                  <TrashIcon className="size-4" />
                  <p className="ml-2 text-sm font-semibold">Delete channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Hint
          label="View all members of this channel"
          side="bottom"
          align="center"
        >
          <Button variant={"outline"} size={"sm"} onClick={() => setOpen(true)}>
            <User2 className="size-5 mr-1 text-muted-foreground" />
            {members?.length}
          </Button>
        </Hint>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Find members..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Members">
              {members?.map((member) => (
                <CommandItem
                  key={member._id}
                  onSelect={() => onMemberClick(member._id)}
                >
                  {member.user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <button className="flex items-center mt-2 gap-1 mx-2 border-b-white font-semibold  border-b-2 w-auto">
        <MessageCircle className="size-4" />
        <span className="text-sm">Messages</span>
      </button>
    </div>
  );
}

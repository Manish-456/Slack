import React from "react";
import { useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/use-get-member";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Loader,
  XIcon,
  MailIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useUpdateMember } from "../api/use-update-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useCurrentMember } from "../api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useChannelId } from "@/hooks/use-channel-id";

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

export function Profile({ memberId, onClose }: ProfileProps) {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const [LeaveDialog, confirmLeave] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave this workspace?"
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this workspace?"
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Change role",
    "Are you sure you want to change this member's role?"
  );

  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember({
      workspaceId,
    });
  const { data: member, isLoading: isMemberLoading } = useGetMember({
    id: memberId,
  });

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const onRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;

    removeMember(
      {
        id: memberId,
      },
      {
        onSuccess: () => {
          toast.success("Member removed");
          onClose();
          router.replace("/");
        },
        onError: () => {
          toast.error("Failed to remove member");
        },
      }
    );
  };

  const onLeave = async () => {
    const ok = await confirmLeave();
    if (!ok) return;

    removeMember(
      {
        id: memberId,
      },
      {
        onSuccess: () => {
          toast.success("You left the workspace");
          onClose();
          router.replace("/");
        },
        onError: () => {
          toast.error("Failed to leave the workspace");
        },
      }
    );
  };

  const onUpdate = async (role: "admin" | "member") => {
    const ok = await confirmUpdate();
    if (!ok) return;

    updateMember(
      {
        id: memberId,
        role,
      },
      {
        onSuccess: () => {
          toast.success("Role changed");
          onClose();
        },
        onError: () => {
          toast.error("Failed to change role");
        },
      }
    );
  };

  if (isMemberLoading || isLoadingCurrentMember) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
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

  if (!member) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button variant={"ghost"} size={"iconSm"} onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full flex-col gap-y-2 items-center justify-center">
          <AlertTriangle className="size-5 text-rose-500/90" />
          <p className="text-sm text-rose-500/90">Member not found</p>
        </div>
      </div>
    );
  }
  const avatarFallback = member.user.name?.[0].toUpperCase() ?? "M";

  return (
    <>
      <RemoveDialog />
      <UpdateDialog />
      <LeaveDialog />
      <div className="h-full flex flex-col">
        <div
          className={cn(
            "flex justify-between items-center h-[49px] px-4 border-b",
            channelId && "h-[70px]"
          )}
        >
          <p className="text-lg font-bold">Profile</p>
          <Button variant={"ghost"} size={"iconSm"} onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex p-4 flex-col  items-center justify-center">
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} alt={member.user.name} />
            <AvatarFallback className="aspect-square text-6xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member.user.name}</p>
          {currentMember?.role === "admin" && currentMember._id !== memberId ? (
            <div className="flex items-center gap-2 mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"} className="w-full capitalize">
                    {member.role} <ChevronDownIcon className="size-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) =>
                      onUpdate(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant={"outline"} onClick={onRemove} className="w-full">
                Remove
              </Button>
            </div>
          ) : currentMember?._id === memberId &&
            currentMember.role !== "admin" ? (
            <div className="mt-4">
              <Button variant={"outline"} onClick={onLeave} className="w-full">
                Leave
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="text-sm font-bold mb-4">Contact information</p>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              <Link
                href={`mailto:${member.user.email}`}
                className="text-sm hover:underline text-[#1264a3]"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { UserButton } from "@/features/auth/components/user-button";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarButton } from "./sidebar-button";
import { Home, MessageSquareText, MoreVertical, PlusIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export function Sidebar() {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const [_open, setOpen] = useCreateChannelModal();
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SidebarButton
        icon={Home}
        label="Home"
        isActive={
          pathname.includes("workspace") && !pathname.includes("member")
        }
      />
      <SidebarButton
        icon={MessageSquareText}
        isActive={pathname.includes("member")}
        label="DMs"
      />
      <SidebarButton icon={MoreVertical} label="More" />
      <div className="flex flex-col items-center justify-center gap-y-2 mt-auto">
        {currentMember?.role === "admin" && (
          <Hint label={"Create a new channel"} side="right" align="center">
            <Button
              onClick={() => setOpen(true)}
              variant={"ghost"}
              size={"iconSm"}
              className="size-10 shrink-0 rounded-full  p-0.5 text-sm text-[#f9edffcc]"
            >
              <PlusIcon className="size-5" />
            </Button>
          </Hint>
        )}
        <UserButton />
      </div>
    </aside>
  );
}

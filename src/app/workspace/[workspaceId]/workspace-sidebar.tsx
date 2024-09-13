import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";

import WorkspaceHeader from "./workspace-header";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { SidebarItem } from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";

export function WorkspaceSidebar() {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const memberId = useMemberId();
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const [_open, setOpen] = useCreateChannelModal();

  if (workspaceLoading || memberLoading || channelsLoading || membersLoading) {
    return (
      <div className="flex flex-col bg-[#361737] h-full items-center justify-center">
        <Loader className="animate-spin size-5 text-white" />
      </div>
    );
  }
  if (!workspace || !member) {
    return (
      <div className="flex gap-y-2 flex-col bg-[#361737] h-full items-center justify-center">
        <AlertTriangle className="size-5 animate-spin text-white" />
        <p className="text-white text-xs">Workspace not found</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-[#361737] h-full">
      <div className="flex flex-col px-2 mt-3">
        <WorkspaceHeader
          workspace={workspace}
          isAdmin={member.role === "admin"}
        />
      </div>
      <WorkspaceSection
        label={"Channels"}
        hint="New channel"
        onNew={member.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            icon={HashIcon}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection label={"Direct Messages"} hint="New direct message">
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            label={item.user.name}
            image={item.user.image}
            role={item.role}
            variant={item._id === memberId ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
}

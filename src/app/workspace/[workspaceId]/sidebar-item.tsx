import Link from "next/link";
import React from "react";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const sidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc] hover:bg-[#8d2371]",
        active: "text-[#f9edffcc] bg-[#8d2391] hover:bg-[#8d2391]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type SidebarItemProps = {
  label: string;
  icon: LucideIcon;
  id: string;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
};

export function SidebarItem({
  label,
  icon: Icon,
  id,
  variant,
}: SidebarItemProps) {
  const workspaceId = useWorkspaceId();
  return (
    <Button
      variant={"transparent"}
      size={"sm"}
      className={cn(sidebarItemVariants({ variant }))}
      asChild
    >
      <Link href={`/workspace/${workspaceId}/channel/${id}`}>
        <Icon className="size-3.5 mr-1 shrink-0" />
        <span className="text-sm truncate ">{label}</span>
      </Link>
    </Button>
  );
}

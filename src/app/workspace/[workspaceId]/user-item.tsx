import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaUserLock } from "react-icons/fa";

const userItemVariant = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
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

interface UserItemProps {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariant>["variant"];
  role: "admin" | "member";
}

export function UserItem({
  id,
  label = "Member",
  image,
  variant,
  role,
}: UserItemProps) {
  const avatarFallback = label.charAt(0).toUpperCase();
  const workspaceId = useWorkspaceId();
  return (
    <Button
      variant={"transparent"}
      className={cn(userItemVariant({ variant: variant }))}
      size={"sm"}
      asChild
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="size-5 mr-1">
          <AvatarImage src={image} alt={label} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{label}</span>

        {role === "admin" && <FaUserLock className="ml-auto shrink-0" />}
      </Link>
    </Button>
  );
}

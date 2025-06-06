import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface SidebarButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
}

export function SidebarButton({
  icon: Icon,
  label,
  isActive,
}: SidebarButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group">
      <Button
        variant={"transparent"}
        className={cn(
          "size-9 p-2 group-hover:bg-accent/20",
          isActive && "bg-[#8d2391]"
        )}
      >
        <Icon className="size-5 text-white group-hover:scale-110 transition-all" />
      </Button>
      <span className="text-[11px] text-white group-hover:text-white/80">
        {label}
      </span>
    </div>
  );
}

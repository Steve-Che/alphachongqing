import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconProps = {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({
  icon: LucideIconComponent,
  size = 18,
  strokeWidth = 1.5,
  className,
}: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
}

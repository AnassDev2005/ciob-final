
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  badge: string | null;
  className?: string;
}

export function ProductBadge({ badge, className }: ProductBadgeProps) {
  if (!badge) return null;

  const isImage = badge.startsWith("http");

  if (isImage) {
    return (
      <img
        src={badge}
        alt="Badge"
        className={cn("h-10 w-auto object-contain z-10", className)}
      />
    );
  }

  return (
    <Badge
      className={cn(
        "bg-red-brand text-white border-none shadow-md z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
        className
      )}
    >
      {badge}
    </Badge>
  );
}

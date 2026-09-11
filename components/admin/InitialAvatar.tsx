import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/admin-data";

export function InitialAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-primary font-medium text-primary-foreground",
        className
      )}
      aria-hidden
    >
      <span className="text-[10px] leading-none tracking-wide">
        {getInitials(name)}
      </span>
    </div>
  );
}
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/student/ui/badge";
import { Button } from "@/components/student/ui/button";
import { Progress } from "@/components/student/ui/progress";
import type { LessonRowData } from "./types";

export function LessonRow({
  data,
  onOpen,
}: {
  data: LessonRowData;
  onOpen?: () => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (onOpen) {
      onOpen();
    } else if (data.href) {
      router.push(data.href);
    }
  };

  return (
    // A full-width ghost button gives each row a large tap target on touch screens.
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      className="h-auto w-full justify-start gap-3 rounded-lg px-2 py-2.5"
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {data.title}
      </span>
      <Badge
        variant="outline"
        className="shrink-0 rounded-full bg-transparent font-mono text-[10px] uppercase tracking-widest"
      >
        {data.kind}
      </Badge>
      <span className="flex w-24 shrink-0 items-center gap-2">
        <Progress
          value={data.progress}
          aria-label={`${data.title} progress`}
          className="h-1"
        />
        <span className="w-7 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
          {data.progress}%
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Button>
  );
}
"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export const VIDEO_PROVIDERS: { value: string; label: string }[] = [
  { value: "VIMEO", label: "Vimeo" },
  { value: "CLOUDFLARE", label: "Cloudflare Stream" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "BUNNY", label: "Bunny CDN" },
  { value: "S3_HLS", label: "AWS S3 / HLS" },
  { value: "OTHER", label: "Other / direct URL" },
];

export type VideoFormState = {
  title: string;
  provider: string;
  video_url: string;
  external_id: string;
  thumbnail_url: string;
  duration_in_seconds: string;
};

export const emptyVideoForm: VideoFormState = {
  title: "",
  provider: "YOUTUBE",
  video_url: "",
  external_id: "",
  thumbnail_url: "",
  duration_in_seconds: "",
};

export function VideoFields({
  form,
  setForm,
}: {
  form: VideoFormState;
  setForm: React.Dispatch<React.SetStateAction<VideoFormState>>;
}) {
  return (
    <div className="space-y-1.5 rounded-md border border-border bg-zinc-50 p-3">
      <div className="grid gap-1.5 sm:grid-cols-2">
        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Video title"
          className={inputClass}
        />
        <select
          value={form.provider}
          onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
          className={inputClass}
        >
          {VIDEO_PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          value={form.video_url}
          onChange={(e) => setForm((p) => ({ ...p, video_url: e.target.value }))}
          placeholder="Video URL (https://...)"
          className={inputClass}
        />
        <input
          value={form.duration_in_seconds}
          onChange={(e) => setForm((p) => ({ ...p, duration_in_seconds: e.target.value }))}
          placeholder="Duration (seconds)"
          type="number"
          min="0"
          className={inputClass}
        />
        <input
          value={form.external_id}
          onChange={(e) => setForm((p) => ({ ...p, external_id: e.target.value }))}
          placeholder="External ID (optional)"
          className={inputClass}
        />
        <input
          value={form.thumbnail_url}
          onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
          placeholder="Thumbnail URL (optional)"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function VideoSummary({
  video,
  onEdit,
}: {
  video: { title: string; provider: string; video_url: string; duration_in_seconds: number; thumbnail_url: string | null };
  onEdit: () => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md border border-border bg-zinc-50 px-2 py-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{video.title || "Video"}</span>
      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{video.provider}</span>
      <span className="max-w-[260px] truncate font-mono">{video.video_url}</span>
      {video.duration_in_seconds > 0 && <span>{video.duration_in_seconds}s</span>}
      <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
        <Pencil size={12} />
      </Button>
    </div>
  );
}

export function VideoEditControls({
  busy,
  onSave,
  onCancel,
}: {
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onSave}>
        Save video
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        <X size={13} />
      </Button>
    </div>
  );
}

export function TrashButton({
  busy,
  onConfirm,
}: {
  busy: boolean;
  onConfirm: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={onConfirm}
    >
      <Trash2 size={13} />
    </Button>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { vendorSubmit } from "@/lib/actions/visits";
import { cn } from "@/lib/utils";
import { Camera, Check, X, Loader2, AlertTriangle, Send } from "lucide-react";

type Item = { key: string; label: string; photo?: boolean };
type Photo = { url: string; caption: string; stepKey?: string; uploading?: boolean; localUrl?: string };

const ATTN = [
  { v: "none", label: "All routine", sub: "Nothing to flag" },
  { v: "note", label: "Something to know", sub: "No action needed" },
  { v: "decision", label: "Needs a decision", sub: "Owner should choose" },
  { v: "urgent", label: "Urgent", sub: "Office calls now" },
];

async function shrink(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", 0.82));
}

export function VendorReport({
  token,
  orgName,
  checklist,
  minPhotos,
  arrivedAt,
  existing,
}: {
  token: string;
  orgName: string;
  checklist: Item[];
  minPhotos: number;
  arrivedAt: string | null;
  existing: { items: string[]; note: string; attention: string; attentionNote: string; photos: { url: string; caption: string }[] } | null;
}) {
  const draftKey = `bd-draft-${token}`;
  const [items, setItems] = useState<string[]>(existing?.items ?? []);
  const [photos, setPhotos] = useState<Photo[]>(existing?.photos.map((p) => ({ ...p })) ?? []);
  const [note, setNote] = useState(existing?.note ?? "");
  const [attention, setAttention] = useState(existing?.attention ?? "none");
  const [attentionNote, setAttentionNote] = useState(existing?.attentionNote ?? "");
  const [stepForPhoto, setStepForPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep a draft on the phone so a dropped signal never loses the work.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw && !existing) {
        const d = JSON.parse(raw);
        setItems(d.items ?? []);
        setNote(d.note ?? "");
        setAttention(d.attention ?? "none");
        setAttentionNote(d.attentionNote ?? "");
        setPhotos((d.photos ?? []).filter((p: Photo) => p.url));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ items, note, attention, attentionNote, photos: photos.filter((p) => !p.uploading) }));
    } catch {}
  }, [items, note, attention, attentionNote, photos, draftKey]);

  const toggle = (k: string) => setItems((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]));

  const pick = (stepKey: string | null) => {
    setStepForPhoto(stepKey);
    fileRef.current?.click();
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const step = stepForPhoto;
    const label = step ? checklist.find((c) => c.key === step)?.label ?? "" : "";
    for (const file of Array.from(files)) {
      const localUrl = URL.createObjectURL(file);
      const temp: Photo = { url: "", caption: label, stepKey: step ?? undefined, uploading: true, localUrl };
      setPhotos((ps) => [...ps, temp]);
      try {
        const blob = await shrink(file);
        const fd = new FormData();
        fd.append("token", token);
        fd.append("file", new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        setPhotos((ps) => ps.map((p) => (p.localUrl === localUrl ? { ...p, url: json.url, uploading: false } : p)));
      } catch {
        setPhotos((ps) => ps.filter((p) => p.localUrl !== localUrl));
      }
    }
    if (step && !items.includes(step)) setItems((xs) => [...xs, step]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const photoSteps = checklist.filter((c) => c.photo);
  const missingPhotoSteps = photoSteps.filter((c) => items.includes(c.key) && !photos.some((p) => p.stepKey === c.key && p.url));
  const ready = photos.filter((p) => p.url);
  const uploading = photos.some((p) => p.uploading);
  const blockers = useMemo(() => {
    const out: string[] = [];
    if (items.length === 0) out.push("Tick at least one step");
    if (ready.length < minPhotos) out.push(`Add ${minPhotos - ready.length} more ${minPhotos - ready.length === 1 ? "photo" : "photos"}`);
    if (missingPhotoSteps.length) out.push(`Photo needed: ${missingPhotoSteps.map((c) => c.label.toLowerCase()).join(", ")}`);
    if (attention !== "none" && !attentionNote.trim()) out.push("Say what the office should know");
    if (uploading) out.push("Photos still uploading");
    return out;
  }, [items.length, ready.length, minPhotos, missingPhotoSteps, attention, attentionNote, uploading]);

  return (
    <form
      action={vendorSubmit}
      onSubmit={() => {
        setSubmitting(true);
        try {
          localStorage.removeItem(draftKey);
        } catch {}
      }}
      className="mt-6"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="photos" value={JSON.stringify(ready.map((p) => ({ url: p.url, caption: p.caption })))} />
      <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone">Checklist</p>
        <p className="text-xs text-stone">
          {arrivedAt ? `Checked in ${arrivedAt} · ` : ""}
          {items.length}/{checklist.length}
        </p>
      </div>
      <ul className="mt-2 space-y-2">
        {checklist.map((c) => {
          const on = items.includes(c.key);
          const hasPhoto = photos.some((p) => p.stepKey === c.key && p.url);
          return (
            <li key={c.key} className={cn("flex items-center gap-3 rounded-2xl bg-card px-3 py-3 shadow-xs transition", on && "ring-1 ring-primary/40")}>
              <input type="checkbox" name="items" value={c.key} checked={on} onChange={() => toggle(c.key)} className="sr-only" />
              <button type="button" onClick={() => toggle(c.key)} className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition", on ? "border-primary bg-primary text-primary-foreground" : "border-ceramic bg-card")} aria-pressed={on} aria-label={c.label}>
                {on ? <Check className="h-4 w-4" /> : null}
              </button>
              <button type="button" onClick={() => toggle(c.key)} className="min-w-0 flex-1 text-left text-base leading-snug">
                {c.label}
              </button>
              {c.photo ? (
                <button type="button" onClick={() => pick(c.key)} className={cn("flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-medium", hasPhoto ? "bg-success-soft text-success" : "bg-primary-soft text-primary")}>
                  <Camera className="h-4 w-4" /> {hasPhoto ? "Added" : "Photo"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone">Photos</p>
        <p className="text-xs text-stone">
          {ready.length} added · {minPhotos} minimum
        </p>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {photos.map((p, n) => (
          <div key={n} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.localUrl ?? p.url} alt="" className={cn("h-full w-full object-cover", p.uploading && "opacity-50")} />
            {p.uploading ? <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-primary" /> : null}
            <button type="button" onClick={() => setPhotos((ps) => ps.filter((_, i) => i !== n))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-abyss/70 text-white" aria-label="Remove photo">
              <X className="h-3.5 w-3.5" />
            </button>
            {p.caption ? <span className="absolute inset-x-0 bottom-0 truncate bg-abyss/60 px-1.5 py-0.5 text-xs text-white">{p.caption}</span> : null}
          </div>
        ))}
        <button type="button" onClick={() => pick(null)} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ceramic text-primary">
          <Camera className="h-6 w-6" />
          <span className="text-xs font-medium">Add photo</span>
        </button>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-stone">Anything the owner should know?</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {ATTN.map((a) => (
          <label key={a.v} className={cn("cursor-pointer rounded-2xl border bg-card px-3 py-2.5 shadow-xs transition", attention === a.v ? (a.v === "urgent" ? "border-danger bg-danger-soft" : "border-primary bg-primary-soft") : "border-transparent")}>
            <input type="radio" name="attention" value={a.v} checked={attention === a.v} onChange={() => setAttention(a.v)} className="sr-only" />
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {a.v === "urgent" ? <AlertTriangle className="h-3.5 w-3.5 text-danger" /> : null}
              {a.label}
            </span>
            <span className="block text-xs text-stone">{a.sub}</span>
          </label>
        ))}
      </div>
      {attention !== "none" ? (
        <textarea
          name="attentionNote"
          value={attentionNote}
          onChange={(e) => setAttentionNote(e.target.value)}
          rows={3}
          placeholder={attention === "urgent" ? "What is wrong and where?" : attention === "decision" ? "What needs deciding, and what does it cost?" : "What did you notice?"}
          className="mt-2 w-full rounded-2xl border border-border bg-card px-3.5 py-3 text-base leading-snug shadow-xs outline-none focus:border-primary"
        />
      ) : null}

      <textarea name="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Notes for the office (optional)" className="mt-3 w-full rounded-2xl border border-border bg-card px-3.5 py-3 text-base leading-snug shadow-xs outline-none focus:border-primary" />
      <p className="mt-1.5 px-1 text-xs text-stone">The office rewrites this for the owner. Short and honest is perfect.</p>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto max-w-lg">
          {blockers.length ? <p className="mb-2 text-center text-xs text-stone">{blockers[0]}</p> : <p className="mb-2 text-center text-xs text-success">Ready. Goes to the {orgName} office for approval.</p>}
          <button type="submit" disabled={blockers.length > 0 || submitting} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg disabled:opacity-40 active:scale-[0.99]">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Submit report
          </button>
        </div>
      </div>
    </form>
  );
}

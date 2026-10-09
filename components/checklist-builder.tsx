"use client";

import { useState } from "react";
import { saveServiceType, deleteServiceType } from "@/lib/actions/directory";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Camera, GripVertical, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type Item = { key: string; label: string; photo?: boolean };

export function ChecklistBuilder({
  trades,
  service,
}: {
  trades: string[];
  service: { id: string; name: string; trade: string; instructions: string; checklist: Item[]; minPhotos: number; durationMin: number } | null;
}) {
  const [items, setItems] = useState<Item[]>(service?.checklist ?? [{ key: "step_1", label: "", photo: false }]);
  const [name, setName] = useState(service?.name ?? "");
  const [trade, setTrade] = useState(service?.trade ?? trades[0] ?? "");

  const update = (i: number, patch: Partial<Item>) => setItems((xs) => xs.map((x, n) => (n === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const copy = [...xs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <form action={saveServiceType} className="grid gap-6 lg:grid-cols-12">
      {service ? <input type="hidden" name="serviceTypeId" value={service.id} /> : null}
      <input type="hidden" name="checklist" value={JSON.stringify(items)} />
      <div className="space-y-5 lg:col-span-7">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Checklist name" className="sm:col-span-2">
              <Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekly pool service" required />
            </Field>
            <Field label="Trade">
              <Select name="trade" value={trade} onChange={(e) => setTrade(e.target.value)}>
                {trades.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minutes">
                <Input name="durationMin" type="number" defaultValue={service?.durationMin ?? 60} min={5} />
              </Field>
              <Field label="Min photos">
                <Input name="minPhotos" type="number" defaultValue={service?.minPhotos ?? 1} min={0} />
              </Field>
            </div>
            <Field label="Instructions for the vendor" hint="Shown at the top of their visit page." className="sm:col-span-2">
              <Textarea name="instructions" defaultValue={service?.instructions ?? ""} placeholder="Photograph the equipment pad and the pool surface before you leave." />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Steps</p>
            <p className="text-xs text-subtle">{items.length} steps</p>
          </div>
          <ol className="mt-3 space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl border border-border px-2 py-2">
                <GripVertical className="h-4 w-4 shrink-0 text-subtle" />
                <span className="w-5 text-right text-xs tabular text-subtle">{i + 1}.</span>
                <input value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Skimmed and brushed" className="h-9 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm outline-none focus:border-primary" />
                <button type="button" onClick={() => update(i, { photo: !it.photo })} className={cn("inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium transition", it.photo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")} title="Require a photo for this step">
                  <Camera className="h-3.5 w-3.5" /> Photo
                </button>
                <button type="button" onClick={() => move(i, -1)} className="h-8 w-8 rounded-lg text-subtle hover:bg-muted hover:text-foreground" aria-label="Move up">
                  <ArrowUp className="mx-auto h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="h-8 w-8 rounded-lg text-subtle hover:bg-muted hover:text-foreground" aria-label="Move down">
                  <ArrowDown className="mx-auto h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setItems((xs) => xs.filter((_, n) => n !== i))} className="h-8 w-8 rounded-lg text-subtle hover:bg-danger-soft hover:text-danger" aria-label="Remove">
                  <Trash2 className="mx-auto h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ol>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setItems((xs) => [...xs, { key: `step_${Date.now().toString(36)}`, label: "", photo: false }])}>
            <Plus className="h-3.5 w-3.5" /> Add a step
          </Button>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-border bg-abyss p-4 text-porcelain">
          <p className="text-xs font-semibold uppercase tracking-wider text-porcelain/60">On the vendor’s phone</p>
          <div className="mt-3 rounded-2xl bg-porcelain p-4 text-ink">
            <p className="text-xs uppercase tracking-wider text-stone">Casa Palma</p>
            <p className="display text-lg">{name || "Checklist name"}</p>
            <ul className="mt-3 space-y-2">
              {items.filter((x) => x.label.trim()).map((x, n) => (
                <li key={n} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                  <span className="h-5 w-5 rounded-md border-2 border-ceramic" />
                  <span className="flex-1 text-sm">{x.label}</span>
                  {x.photo ? <Camera className="h-4 w-4 text-primary" /> : null}
                </li>
              ))}
              {items.every((x) => !x.label.trim()) ? <li className="text-xs text-stone">Steps appear here as you type.</li> : null}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {service ? (
            <button type="submit" formAction={deleteServiceType} className="text-xs text-muted-foreground hover:text-danger">
              Delete checklist
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg">
            Save checklist
          </Button>
        </div>
      </div>
    </form>
  );
}

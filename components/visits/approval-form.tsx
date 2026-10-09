"use client";

import { useMemo, useState } from "react";
import { approveAndSend, sendBackToVendor } from "@/lib/actions/visits";
import { Button, Field, Input, Textarea, Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { ATTENTION, ROLE_LABEL } from "@/lib/format";
import { MessageSquare, Mail, RotateCcw, Undo2, Send } from "lucide-react";

export type ApprovalProps = {
  visitId: string;
  estateName: string;
  serviceName: string;
  vendorName: string;
  orgName: string;
  recapDraft: string;
  vendorNote: string | null;
  attention: string;
  attentionNote: string | null;
  ownerAction: "fyi" | "decision" | "call";
  decisionPrompt: string | null;
  decisionOptions: string[];
  checklist: { key: string; label: string }[];
  items: string[];
  photos: { url: string; caption: string | null }[];
  contacts: { id: string; name: string; role: string; phone: string | null; email: string | null; smsOptIn: boolean; emailOptIn: boolean; isPrimary: boolean }[];
};

export function ApprovalForm(p: ApprovalProps) {
  const [recap, setRecap] = useState(p.recapDraft);
  const [action, setAction] = useState<"fyi" | "decision" | "call">(p.ownerAction);
  const [prompt, setPrompt] = useState(p.decisionPrompt ?? "");
  const [opt1, setOpt1] = useState(p.decisionOptions[0] ?? "Go ahead and handle it");
  const [opt2, setOpt2] = useState(p.decisionOptions[1] ?? "Call me first");
  const [recipients, setRecipients] = useState<string[]>(p.contacts.filter((c) => c.isPrimary || c.role === "home_manager").map((c) => c.id));
  const [mode, setMode] = useState<"approve" | "sendback">("approve");
  const att = ATTENTION[p.attention] ?? ATTENTION.none;

  const smsPreview = useMemo(() => {
    const first = recap.split(/(?<=\.)\s/)[0] ?? recap;
    const tail = action === "decision" ? ` Reply 1 to ${opt1.toLowerCase()} or 2 to ${opt2.toLowerCase()}.` : action === "call" ? " We will call you shortly." : "";
    return `${p.orgName}: ${first}${tail} Details and photos: [link]`;
  }, [recap, action, opt1, opt2, p.orgName]);

  return (
    <div className="space-y-4">
      {/* What the vendor sent */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">From {p.vendorName}</p>
          <Pill tone={att.tone}>{att.label}</Pill>
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
          {p.checklist.map((c) => {
            const done = p.items.includes(c.key);
            return (
              <li key={c.key} className={cn("flex items-center gap-2 text-sm", done ? "" : "text-subtle line-through")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", done ? "bg-success" : "bg-border")} />
                {c.label}
              </li>
            );
          })}
        </ul>
        {p.vendorNote ? (
          <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm italic text-foreground/80">“{p.vendorNote}”</p>
        ) : null}
        {p.attentionNote ? (
          <p className="mt-2 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">{p.attentionNote}</p>
        ) : null}
      </div>

      <div className="flex gap-1 rounded-xl bg-muted p-1">
        <button type="button" onClick={() => setMode("approve")} className={cn("flex-1 rounded-lg py-1.5 text-xs font-medium transition", mode === "approve" ? "bg-card shadow-xs" : "text-muted-foreground")}>
          Approve and send
        </button>
        <button type="button" onClick={() => setMode("sendback")} className={cn("flex-1 rounded-lg py-1.5 text-xs font-medium transition", mode === "sendback" ? "bg-card shadow-xs" : "text-muted-foreground")}>
          Send back to vendor
        </button>
      </div>

      {mode === "sendback" ? (
        <form action={sendBackToVendor} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <input type="hidden" name="visitId" value={p.visitId} />
          <Field label="What do you need from the vendor?" hint="Texted to the vendor with a link that reopens their report.">
            <Textarea name="note" required placeholder="Please add a photo of the equipment pad and confirm the water level." />
          </Field>
          <div className="mt-3 flex justify-end">
            <Button type="submit" variant="outline">
              <Undo2 className="h-4 w-4" /> Send back
            </Button>
          </div>
        </form>
      ) : (
        <form action={approveAndSend} className="space-y-4">
          <input type="hidden" name="visitId" value={p.visitId} />
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">To the homeowner</p>
              <button type="button" onClick={() => setRecap(p.recapDraft)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3 w-3" /> Reset to draft
              </button>
            </div>
            <textarea
              name="recap"
              value={recap}
              onChange={(e) => setRecap(e.target.value)}
              rows={6}
              className="mt-2 w-full resize-y rounded-xl border border-border bg-input px-3 py-2.5 text-base leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <p className="mt-1 text-xs text-subtle">Drafted from the vendor’s checklist and notes in the office’s voice. Edit anything before it goes out.</p>

            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">What should the homeowner do?</p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["fyi", "Nothing", "For their information"],
                    ["decision", "Decide", "Two reply buttons"],
                    ["call", "Expect a call", "We will phone them"],
                  ] as const
                ).map(([v, label, sub]) => (
                  <label key={v} className={cn("cursor-pointer rounded-xl border px-3 py-2 text-left transition", action === v ? "border-primary bg-primary-soft" : "border-border hover:bg-muted")}>
                    <input type="radio" name="ownerAction" value={v} checked={action === v} onChange={() => setAction(v)} className="sr-only" />
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {action === "decision" ? (
              <div className="mt-4 space-y-3 rounded-xl bg-muted/60 p-3">
                <Field label="The question">
                  <Input name="decisionPrompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Replace the pump seal for $380 on the next visit?" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Reply 1">
                    <Input name="option1" value={opt1} onChange={(e) => setOpt1(e.target.value)} />
                  </Field>
                  <Field label="Reply 2">
                    <Input name="option2" value={opt2} onChange={(e) => setOpt2(e.target.value)} />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Send to</p>
            <ul className="mt-2 divide-y divide-border/70">
              {p.contacts.map((c) => {
                const on = recipients.includes(c.id);
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2">
                    <input
                      id={`r-${c.id}`}
                      type="checkbox"
                      name="recipients"
                      value={c.id}
                      checked={on}
                      onChange={(e) => setRecipients((r) => (e.target.checked ? [...r, c.id] : r.filter((x) => x !== c.id)))}
                      className="h-4 w-4 rounded border-border accent-[#224b82]"
                    />
                    <label htmlFor={`r-${c.id}`} className="min-w-0 flex-1 cursor-pointer">
                      <span className="block text-sm font-medium">
                        {c.name} <span className="font-normal text-muted-foreground">· {ROLE_LABEL[c.role] ?? c.role}</span>
                      </span>
                    </label>
                    <span className="flex items-center gap-1.5 text-subtle">
                      {c.phone && c.smsOptIn ? <MessageSquare className="h-3.5 w-3.5" aria-label="Text" /> : null}
                      {c.email && c.emailOptIn ? <Mail className="h-3.5 w-3.5" aria-label="Email" /> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-chalk p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone">Text preview</p>
            <div className="mt-2 max-w-xs rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 text-sm leading-snug shadow-xs">{smsPreview}</div>
            <p className="mt-1.5 text-xs text-stone">{smsPreview.length} characters · the email carries the full note and photos</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" size="lg" disabled={recipients.length === 0}>
              <Send className="h-4 w-4" /> Approve and send
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

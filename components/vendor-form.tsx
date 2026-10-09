"use client";

import { useState } from "react";
import { createVendor } from "@/lib/actions/directory";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function VendorForm({ trades, estates }: { trades: string[]; estates: { id: string; name: string }[] }) {
  const [trade, setTrade] = useState(trades[0] ?? "");
  const [custom, setCustom] = useState(false);
  const [rating, setRating] = useState(0);
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");

  return (
    <form action={createVendor} className="grid gap-6 lg:grid-cols-12">
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="space-y-5 lg:col-span-7">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">The company</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Company name" className="sm:col-span-2">
              <Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pristine Pools" required />
            </Field>
            <Field label="Trade">
              {custom ? (
                <Input name="trade" value={trade} onChange={(e) => setTrade(e.target.value)} placeholder="Dock and seawall" required autoFocus />
              ) : (
                <Select
                  name="trade"
                  value={trade}
                  onChange={(e) => {
                    if (e.target.value === "__new") {
                      setCustom(true);
                      setTrade("");
                    } else setTrade(e.target.value);
                  }}
                  required
                >
                  {trades.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="__new">Something else…</option>
                </Select>
              )}
            </Field>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Private rating</p>
              <div className="flex h-10 items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n === rating ? 0 : n)} className={cn("transition", n <= rating ? "text-brass" : "text-border hover:text-sand")} aria-label={`${n} stars`}>
                    <Star className={cn("h-6 w-6", n <= rating && "fill-current")} />
                  </button>
                ))}
                <span className="ml-2 text-xs text-subtle">Only the office sees this.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Who gets the texts</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Contact name">
              <Input name="contactName" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Marco Santini" />
            </Field>
            <Field label="Mobile" hint="Visit links are texted here.">
              <Input name="phone" placeholder="(561) 555-0201" inputMode="tel" />
            </Field>
            <Field label="Email" hint="Visit links are emailed here too.">
              <Input name="email" placeholder="marco@example.com" inputMode="email" />
            </Field>
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">How to reach them</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted/60">
                  <input type="hidden" name="notifySms" value="off" />
                  <input type="checkbox" name="notifySms" value="on" defaultChecked className="h-4 w-4 accent-[#224b82]" />
                  <span className="text-sm">Text</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted/60">
                  <input type="hidden" name="notifyEmail" value="off" />
                  <input type="checkbox" name="notifyEmail" value="on" defaultChecked className="h-4 w-4 accent-[#224b82]" />
                  <span className="text-sm">Email</span>
                </label>
              </div>
            </div>
            <Field label="Office notes" hint="Vendors never see this." className="sm:col-span-2">
              <Textarea name="notes" placeholder="Best in the county. Texts back within minutes. Ask for Marco on anything mechanical." />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Houses they serve</p>
          <p className="mt-1 text-xs text-muted-foreground">They become the usual {trade ? trade.toLowerCase() : ""} vendor at each house you tick.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {estates.map((e) => (
              <label key={e.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted/60">
                <input type="checkbox" name="estates" value={e.id} className="h-4 w-4 accent-[#224b82]" />
                <span className="text-sm">{e.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-border bg-chalk p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone">Their welcome message</p>
          <div className="mt-3 max-w-sm rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 text-sm leading-snug shadow-xs">
            Bluedoor Building: {contact.split(" ")[0] || "Hello"}, you are set up as our {trade ? trade.toLowerCase() : "service"} vendor. Each visit will come to you with a link. Your schedule: [link]
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="sendInvite" defaultChecked className="h-4 w-4 accent-[#224b82]" />
            <span className="text-sm">Send it now</span>
          </label>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">No app, no password</p>
          <p className="mt-2 text-muted-foreground">Each visit arrives by text, email, or both. The link opens the house, the gate code on the day, the checklist, and a camera button.</p>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Add {name || "vendor"}
        </Button>
      </div>
    </form>
  );
}

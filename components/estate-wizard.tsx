"use client";

import { useState } from "react";
import { createEstate } from "@/lib/actions/directory";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check } from "lucide-react";

type Vendor = { id: string; name: string; trade: string; contactName: string | null };
type Service = { id: string; name: string; trade: string };
type Person = { name: string; role: string; email: string; phone: string; sms: boolean; emailOk: boolean };

const COVERS = [
  "/estates/estate-palms.jpg",
  "/estates/estate-colonial.jpg",
  "/estates/estate-bougainvillea.jpg",
  "/estates/house-shingle.jpg",
  "/estates/house-stone.jpg",
  "/estates/loggia-ocean.jpg",
  "/estates/aerial-oceanfront.jpg",
  "/estates/courtyard-modern.jpg",
];

const STEPS = ["Property", "People", "Vendors", "Services", "Review"];

export function EstateWizard({ vendors, services }: { vendors: Vendor[]; services: Service[] }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Palm Beach");
  const [cover, setCover] = useState(COVERS[1]);
  const [people, setPeople] = useState<Person[]>([{ name: "", role: "homeowner", email: "", phone: "", sms: true, emailOk: true }]);
  const [vendorByTrade, setVendorByTrade] = useState<Record<string, string>>({});
  const [cadence, setCadence] = useState<Record<string, string>>({});
  const trades = [...new Set(vendors.map((v) => v.trade))].sort();

  const update = (i: number, patch: Partial<Person>) => setPeople((ps) => ps.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? people.some((p) => p.name.trim()) : true;

  return (
    <form action={createEstate} className="grid gap-6 lg:grid-cols-12">
      <input type="hidden" name="people" value={JSON.stringify(people)} />
      <input type="hidden" name="coverImage" value={cover} />

      <aside className="lg:col-span-3">
        <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition", i === step ? "bg-primary text-primary-foreground" : i < step ? "text-foreground hover:bg-muted" : "text-subtle")}
              >
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold", i === step ? "bg-white/20" : i < step ? "bg-success-soft text-success" : "bg-muted")}>{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className="space-y-4 lg:col-span-9">
        {/* Step 1 */}
        <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs", step !== 0 && "hidden")}>
          <h2 className="text-sm font-semibold">The property</h2>
          <p className="text-xs text-muted-foreground">How the house appears everywhere, including in the owner’s messages.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="House name" hint="Owners see this in every text. “Casa Palma”, not the street number." className="sm:col-span-2">
              <Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Casa Palma" required />
            </Field>
            <Field label="Street address">
              <Input name="address1" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="1410 S Ocean Blvd" />
            </Field>
            <div className="grid grid-cols-[1fr_72px_96px] gap-2">
              <Field label="City">
                <Input name="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="State">
                <Input name="state" defaultValue="FL" />
              </Field>
              <Field label="Zip">
                <Input name="zip" placeholder="33480" />
              </Field>
            </div>
            <Field label="Gate code" hint="Shown to the vendor on the day of the visit only.">
              <Input name="gateCode" placeholder="4471" />
            </Field>
            <Field label="Access notes">
              <Input name="accessNotes" placeholder="Service entrance on the north side." />
            </Field>
            <Field label="House notes" hint="For the office. Owners never see this." className="sm:col-span-2">
              <Textarea name="notes" placeholder="Owners in New York June through October. No vendors before 9 am." />
            </Field>
          </div>
          <p className="mt-4 mb-1.5 text-xs font-medium text-muted-foreground">Cover photo</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {COVERS.map((c) => (
              <button key={c} type="button" onClick={() => setCover(c)} className={cn("aspect-[4/3] overflow-hidden rounded-lg border-2 bg-cover bg-center transition", cover === c ? "border-primary" : "border-transparent hover:border-border")} style={{ backgroundImage: `url(${c})` }} aria-label="Choose cover" />
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs", step !== 1 && "hidden")}>
          <h2 className="text-sm font-semibold">People</h2>
          <p className="text-xs text-muted-foreground">Who receives reports. The first person is the primary contact. Home managers and assistants can be copied.</p>
          <div className="mt-4 space-y-3">
            {people.map((p, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={i === 0 ? "Name (primary)" : "Name"}>
                    <Input value={p.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Catherine Whitlock" />
                  </Field>
                  <Field label="Role">
                    <Select value={p.role} onChange={(e) => update(i, { role: e.target.value })}>
                      <option value="homeowner">Homeowner</option>
                      <option value="home_manager">Home manager</option>
                      <option value="assistant">Assistant</option>
                    </Select>
                  </Field>
                  <Field label="Mobile">
                    <Input value={p.phone} onChange={(e) => update(i, { phone: e.target.value })} placeholder="(917) 555-0171" inputMode="tel" />
                  </Field>
                  <Field label="Email">
                    <Input value={p.email} onChange={(e) => update(i, { email: e.target.value })} placeholder="catherine@example.com" inputMode="email" />
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={p.sms} onChange={(e) => update(i, { sms: e.target.checked })} className="h-4 w-4 accent-[#224b82]" /> Text reports
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={p.emailOk} onChange={(e) => update(i, { emailOk: e.target.checked })} className="h-4 w-4 accent-[#224b82]" /> Email reports
                  </label>
                  {people.length > 1 ? (
                    <button type="button" onClick={() => setPeople((ps) => ps.filter((_, n) => n !== i))} className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-danger">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setPeople((ps) => [...ps, { name: "", role: "home_manager", email: "", phone: "", sms: true, emailOk: true }])}>
              <Plus className="h-3.5 w-3.5" /> Add a person
            </Button>
          </div>
        </section>

        {/* Step 3 */}
        <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs", step !== 2 && "hidden")}>
          <h2 className="text-sm font-semibold">Vendors for this house</h2>
          <p className="text-xs text-muted-foreground">The usual vendor per trade. Scheduling pre-fills from this. Leave a trade blank if the house does not need it.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {trades.map((t) => (
              <Field key={t} label={t}>
                <Select name={`vendor[${t}]`} value={vendorByTrade[t] ?? ""} onChange={(e) => setVendorByTrade((m) => ({ ...m, [t]: e.target.value }))}>
                  <option value="">Not needed</option>
                  {vendors
                    .filter((v) => v.trade === t)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                        {v.contactName ? ` (${v.contactName})` : ""}
                      </option>
                    ))}
                </Select>
              </Field>
            ))}
          </div>
        </section>

        {/* Step 4 */}
        <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs", step !== 3 && "hidden")}>
          <h2 className="text-sm font-semibold">Recurring services</h2>
          <p className="text-xs text-muted-foreground">Set the rhythm. Visits generate themselves and the vendor is dispatched automatically.</p>
          <div className="mt-4 divide-y divide-border/70">
            {services.map((s) => {
              const hasVendor = Boolean(vendorByTrade[s.trade]);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.trade}
                      {!hasVendor ? " · assign a vendor first" : ""}
                    </p>
                  </div>
                  <Select name={`recurring[${s.id}]`} value={cadence[s.id] ?? "none"} onChange={(e) => setCadence((m) => ({ ...m, [s.id]: e.target.value }))} disabled={!hasVendor} className="w-36">
                    <option value="none">Not recurring</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every two weeks</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </Select>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 5 */}
        <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs", step !== 4 && "hidden")}>
          <h2 className="text-sm font-semibold">Review</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-[120px_1fr]">
            <div className="aspect-[4/3] rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} />
            <div className="text-sm">
              <p className="display text-xl">{name || "Untitled house"}</p>
              <p className="text-muted-foreground">{[address, city].filter(Boolean).join(", ")}</p>
              <p className="mt-2">
                <span className="font-medium">People:</span> {people.filter((p) => p.name.trim()).map((p) => p.name).join(", ") || "none"}
              </p>
              <p>
                <span className="font-medium">Vendors:</span> {Object.values(vendorByTrade).filter(Boolean).length} assigned
              </p>
              <p>
                <span className="font-medium">Recurring:</span> {Object.values(cadence).filter((c) => c && c !== "none").length} services
              </p>
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-chalk px-3.5 py-3">
            <input type="checkbox" name="sendWelcome" defaultChecked className="mt-0.5 h-4 w-4 accent-[#224b82]" />
            <span>
              <span className="block text-sm font-medium">Send the welcome note</span>
              <span className="block text-xs text-stone">A short text and email to {people[0]?.name.split(" ")[0] || "the primary contact"} with their private page link.</span>
            </span>
          </label>
        </section>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" size="lg">
              Onboard {name || "estate"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

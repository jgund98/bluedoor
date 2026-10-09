"use client";

import { useMemo, useState } from "react";
import { scheduleVisit } from "@/lib/actions/visits";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

type Estate = { id: string; name: string; address1: string | null; city: string | null };
type Service = { id: string; name: string; trade: string; durationMin: number };
type Vendor = { id: string; name: string; trade: string; contactName: string | null; phone: string | null; email: string | null; notifySms: boolean; notifyEmail: boolean };
type Assignment = { estateId: string; trade: string; vendorId: string };

export function ScheduleForm({
  estates,
  services,
  vendors,
  assignments,
  prefill,
}: {
  estates: Estate[];
  services: Service[];
  vendors: Vendor[];
  assignments: Assignment[];
  prefill?: { estateId?: string; serviceTypeId?: string; vendorId?: string; requestId?: string; note?: string; date?: string };
}) {
  const tomorrow = useMemo(() => {
    const d = new Date(Date.now() + 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const [estateId, setEstateId] = useState(prefill?.estateId ?? "");
  const [serviceId, setServiceId] = useState(prefill?.serviceTypeId ?? "");
  const [vendorId, setVendorId] = useState(prefill?.vendorId ?? "");
  const [window, setWindow] = useState("morning");
  const [date, setDate] = useState(prefill?.date ?? tomorrow);
  const [vendorTouched, setVendorTouched] = useState(Boolean(prefill?.vendorId));

  const service = services.find((s) => s.id === serviceId);
  const estate = estates.find((e) => e.id === estateId);
  const assigned = estateId && service ? assignments.find((a) => a.estateId === estateId && a.trade === service.trade)?.vendorId : undefined;
  const tradeVendors = service ? vendors.filter((v) => v.trade === service.trade) : vendors;
  const effectiveVendorId = vendorTouched && vendorId ? vendorId : service ? assigned ?? tradeVendors[0]?.id ?? "" : "";
  const vendor = vendors.find((v) => v.id === effectiveVendorId);

  const dateLabel = useMemo(() => {
    if (!date) return "";
    const d = new Date(`${date}T12:00:00`);
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(d);
  }, [date]);

  return (
    <form action={scheduleVisit} className="grid gap-6 lg:grid-cols-12">
      {prefill?.requestId ? <input type="hidden" name="requestId" value={prefill.requestId} /> : null}
      <div className="space-y-5 lg:col-span-7">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Where and what</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Estate">
              <Select name="estateId" value={estateId} onChange={(e) => setEstateId(e.target.value)} required>
                <option value="">Choose a house</option>
                {estates.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Service">
              <Select
                name="serviceTypeId"
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  setVendorTouched(false);
                }}
                required
              >
                <option value="">Choose a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Vendor" hint={assigned && !vendorTouched ? `Pre-filled from ${estate?.name}’s assigned ${service?.trade.toLowerCase()} vendor.` : service ? `Showing ${service.trade.toLowerCase()} vendors.` : "Pick a service first and the house’s usual vendor fills in."}>
              <Select
                name="vendorId"
                value={effectiveVendorId}
                onChange={(e) => {
                  setVendorId(e.target.value);
                  setVendorTouched(true);
                }}
                required
              >
                <option value="">Choose a vendor</option>
                {tradeVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                    {v.contactName ? ` (${v.contactName})` : ""}
                    {v.id === assigned ? " · usual" : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">When</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <Input type="date" name="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Exact time" hint="Optional. Leave blank to give the vendor the window.">
              <Input type="time" name="time" />
            </Field>
          </div>
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Window</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["morning", "Morning", "8 am to 12 pm"],
                  ["afternoon", "Afternoon", "12 pm to 5 pm"],
                  ["anytime", "Any time", "during the day"],
                ] as const
              ).map(([v, label, sub]) => (
                <label key={v} className={cn("cursor-pointer rounded-xl border px-3 py-2 transition", window === v ? "border-primary bg-primary-soft" : "border-border hover:bg-muted")}>
                  <input type="radio" name="window" value={v} checked={window === v} onChange={() => setWindow(v)} className="sr-only" />
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{sub}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Field label="Note for the vendor" hint="Shown at the top of their visit page.">
              <Textarea name="note" defaultValue={prefill?.note ?? ""} placeholder="The owner mentioned the pool bar outlets keep tripping. Start there." />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-border bg-chalk p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone">What the vendor receives</p>
          {vendor && estate && service ? (
            <div className="mt-3 max-w-sm rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 text-sm leading-snug shadow-xs">
              Bluedoor Building: {service.name} at {estate.name} ({[estate.address1, estate.city].filter(Boolean).join(", ")}) on {dateLabel}, {window === "morning" ? "8 am to 12 pm" : window === "afternoon" ? "12 pm to 5 pm" : "during the day"}. Open your visit: [link]
            </div>
          ) : (
            <p className="mt-3 text-xs text-stone">Choose a house, a service, and a vendor to see the message.</p>
          )}
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="notifyVendor" defaultChecked className="h-4 w-4 accent-[#224b82]" />
            <span className="text-sm">Send to {vendor?.contactName?.split(" ")[0] ?? "the vendor"} now{vendor ? ` by ${[vendor.notifySms && vendor.phone ? "text" : null, vendor.notifyEmail && vendor.email ? "email" : null].filter(Boolean).join(" and ") || "no channel on file"}` : ""}</span>
          </label>
          <p className="mt-1 text-xs text-stone">A reminder goes out automatically one hour before the window. If they have not opened the link 30 minutes in, the office is alerted.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">On their phone they will</p>
          <ol className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-subtle">1.</span> Check in when they arrive.</li>
            <li className="flex gap-2"><span className="text-subtle">2.</span> Tick off the {service ? service.name.toLowerCase() : "service"} checklist.</li>
            <li className="flex gap-2"><span className="text-subtle">3.</span> Add photos and anything the owner should know.</li>
            <li className="flex gap-2"><span className="text-subtle">4.</span> Submit. It lands in Approvals with a draft already written.</li>
          </ol>
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Send className="h-4 w-4" /> Schedule and notify
        </Button>
      </div>
    </form>
  );
}

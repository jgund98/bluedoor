import { requireUser } from "@/lib/auth";
import { schedulingOptions } from "@/lib/queries";
import { PageHeader } from "@/components/ui/primitives";
import { ScheduleForm } from "@/components/schedule-form";

export const metadata = { title: "Schedule a visit" };

export default async function NewVisitPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const o = await schedulingOptions(user.orgId);
  return (
    <div>
      <PageHeader back={{ href: "/schedule", label: "Schedule" }} eyebrow="New visit" title="Schedule a visit" description="Choose the house and the service. The usual vendor is pre-filled." />
      <ScheduleForm
        estates={o.estates.map((e) => ({ id: e.id, name: e.name, address1: e.address1, city: e.city }))}
        services={o.services.map((s) => ({ id: s.id, name: s.name, trade: s.trade, durationMin: s.durationMin }))}
        vendors={o.vendors.filter((v) => v.status === "active").map((v) => ({ id: v.id, name: v.name, trade: v.trade, contactName: v.contactName, phone: v.phone, email: v.email, notifySms: v.notifySms, notifyEmail: v.notifyEmail }))}
        assignments={o.assignments.map((a) => ({ estateId: a.estateId, trade: a.trade, vendorId: a.vendorId }))}
        prefill={{ estateId: sp.estate, serviceTypeId: sp.service, vendorId: sp.vendor, requestId: sp.request, note: sp.note, date: sp.date }}
      />
    </div>
  );
}

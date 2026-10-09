import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getServiceType, schedulingOptions } from "@/lib/queries";
import { PageHeader } from "@/components/ui/primitives";
import { ChecklistBuilder } from "@/components/checklist-builder";

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const isNew = id === "new";
  const service = isNew ? null : await getServiceType(id);
  if (!isNew && !service) notFound();
  const o = await schedulingOptions(user.orgId);
  const trades = [...new Set([...o.vendors.map((v) => v.trade), ...o.services.map((s) => s.trade)])].sort();
  return (
    <div>
      <PageHeader back={{ href: "/services", label: "Services" }} eyebrow={service?.trade ?? "New"} title={service?.name ?? "New checklist"} description="Each step becomes a tap on the vendor’s phone. Mark a step as needing a photo and they cannot submit without one." />
      <ChecklistBuilder
        trades={trades}
        service={
          service
            ? { id: service.id, name: service.name, trade: service.trade, instructions: service.instructions ?? "", checklist: service.checklist, minPhotos: service.minPhotos, durationMin: service.durationMin }
            : null
        }
      />
    </div>
  );
}

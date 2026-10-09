import { requireUser } from "@/lib/auth";
import { schedulingOptions } from "@/lib/queries";
import { PageHeader } from "@/components/ui/primitives";
import { EstateWizard } from "@/components/estate-wizard";

export const metadata = { title: "Onboard an estate" };

export default async function NewEstatePage() {
  const user = await requireUser();
  const o = await schedulingOptions(user.orgId);
  return (
    <div>
      <PageHeader back={{ href: "/estates", label: "Estates" }} eyebrow="Onboarding" title="Onboard an estate" description="Property, people, vendors, recurring services." />
      <EstateWizard vendors={o.vendors.filter((v) => v.status === "active").map((v) => ({ id: v.id, name: v.name, trade: v.trade, contactName: v.contactName }))} services={o.services.map((s) => ({ id: s.id, name: s.name, trade: s.trade }))} />
    </div>
  );
}

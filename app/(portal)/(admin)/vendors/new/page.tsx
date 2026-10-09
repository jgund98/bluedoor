import { requireUser } from "@/lib/auth";
import { schedulingOptions } from "@/lib/queries";
import { PageHeader } from "@/components/ui/primitives";
import { VendorForm } from "@/components/vendor-form";

export const metadata = { title: "Add a vendor" };

export default async function NewVendorPage() {
  const user = await requireUser();
  const o = await schedulingOptions(user.orgId);
  const trades = [...new Set([...o.vendors.map((v) => v.trade), ...o.services.map((s) => s.trade)])].sort();
  return (
    <div>
      <PageHeader back={{ href: "/vendors", label: "Vendors" }} eyebrow="Onboarding" title="Add a vendor" description="Vendors receive a link per visit by text or email. Assign them to the houses they serve." />
      <VendorForm trades={trades} estates={o.estates.map((e) => ({ id: e.id, name: e.name }))} />
    </div>
  );
}

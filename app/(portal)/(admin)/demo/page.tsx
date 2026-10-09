import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { listVisits, listEstates, getVendor } from "@/lib/queries";
import { baseUrl as getBaseUrl } from "@/lib/notify";
import { PageHeader, Card, Pill } from "@/components/ui/primitives";
import { CopyLink } from "@/components/copy-link";
import { isToday } from "@/lib/format";

export const metadata = { title: "Try it on a phone" };

async function qr(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#14294a", light: "#ffffff" }, errorCorrectionLevel: "M" });
}

export default async function DemoPage() {
  const user = await requireUser();
  const base = await getBaseUrl();
  const [visits, estates] = await Promise.all([listVisits(user.orgId), listEstates(user.orgId)]);
  const onSite = visits.find((r) => r.visit.status === "in_progress");
  const scheduledToday = visits.find((r) => r.visit.status === "scheduled" && isToday(r.visit.scheduledFor));
  const decisionSent = visits.find((r) => r.visit.status === "sent" && r.report?.ownerAction === "decision");
  const routineSent = visits.find((r) => r.visit.status === "sent" && r.report?.ownerAction === "fyi" && r.photos.length);
  const vendor = onSite ? await getVendor(onSite.vendor.id) : null;
  const homeowner = estates.find((e) => e.primary)?.primary ?? null;
  const homeEstate = estates.find((e) => e.primary)?.estate ?? null;

  const cards = [
    onSite && { title: "Vendor, on site right now", who: `${onSite.vendor.contactName ?? onSite.vendor.name} at ${onSite.estate.name}`, sub: "The checklist, photos, and the submit button. Files straight into Approvals.", path: `/v/${onSite.visit.vendorToken}`, tone: "navy" as const },
    scheduledToday && { title: "Vendor, before arriving", who: `${scheduledToday.vendor.contactName ?? scheduledToday.vendor.name} at ${scheduledToday.estate.name}`, sub: "Address, gate code, instructions, and the check-in button.", path: `/v/${scheduledToday.visit.vendorToken}`, tone: "blue" as const },
    vendor && { title: "Vendor’s whole schedule", who: vendor.vendor.name, sub: "Every visit coming up for this vendor, from the welcome text.", path: `/vendor/${vendor.vendor.token}`, tone: "blue" as const },
    decisionSent && { title: "Homeowner, decision needed", who: `${decisionSent.estate.name} · ${decisionSent.service.name}`, sub: "What the owner receives when something needs a yes or no. Tap a reply and watch it land in Today.", path: `/r/${decisionSent.visit.ownerToken}`, tone: "amber" as const },
    routineSent && { title: "Homeowner, routine visit", who: `${routineSent.estate.name} · ${routineSent.service.name}`, sub: "A quiet report with photos. Nothing to do.", path: `/r/${routineSent.visit.ownerToken}`, tone: "green" as const },
    homeowner && homeEstate && { title: "Homeowner’s private page", who: `${homeowner.name} · ${homeEstate.name}`, sub: "Every visit to the house, what is coming up, and a place to ask for something.", path: `/home/${homeowner.portalToken}`, tone: "green" as const },
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const svgs = await Promise.all(cards.map((c) => qr(`${base}${c.path}`)));

  return (
    <div>
      <PageHeader eyebrow="Try it" title="Hand someone a phone" description="Scan to open the vendor or homeowner screen on a phone. Actions taken there show up here." />
      <p className="mb-5 text-xs text-subtle">
        Links point at <span className="font-medium text-foreground">{base}</span>. A phone must be able to reach that address.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, n) => (
          <Card key={c.path} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.who}</p>
              </div>
              <Pill tone={c.tone}>{c.path.startsWith("/v") || c.path.startsWith("/vendor") ? "Vendor" : "Homeowner"}</Pill>
            </div>
            <div className="mx-auto my-4 w-40 rounded-xl border border-border bg-white p-2" dangerouslySetInnerHTML={{ __html: svgs[n] }} />
            <p className="text-sm text-muted-foreground">{c.sub}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <a href={c.path} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
                Open here
              </a>
              <CopyLink path={c.path} label="Copy link" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

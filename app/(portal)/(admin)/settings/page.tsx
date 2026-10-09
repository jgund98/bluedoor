import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getOrg, listUsers } from "@/lib/queries";
import { deliveryEnabled } from "@/lib/notify";
import { PageHeader, Card, CardHeader, Pill, Button, Avatar, Field, Input, Select, Toggle, Notice } from "@/components/ui/primitives";
import { updateOrg, saveUser, removeUser } from "@/lib/actions/directory";
import { ROLE_LABEL, fmtPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === "staff" ? "staff" : sp.tab === "delivery" ? "delivery" : "company";
  const [org, users] = await Promise.all([getOrg(), listUsers(user.orgId)]);

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Home office" description="Company details, staff, and delivery." />
      {sp.saved ? (
        <div className="mb-5">
          <Notice tone="green">Saved.</Notice>
        </div>
      ) : null}
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-muted p-1 sm:inline-flex">
        {[
          ["company", "Company"],
          ["staff", "Staff"],
          ["delivery", "Delivery"],
        ].map(([k, label]) => (
          <Link key={k} href={`/settings?tab=${k}`} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition", tab === k ? "bg-card shadow-xs" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </Link>
        ))}
      </div>

      {tab === "company" ? (
        <Card className="max-w-2xl p-5">
          <form action={updateOrg} className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" hint="Appears at the start of every text and on every email." className="sm:col-span-2">
              <Input name="name" defaultValue={org.name} required />
            </Field>
            <Field label="Office phone" hint="Shown to homeowners in the email footer.">
              <Input name="phone" defaultValue={org.phone ?? ""} />
            </Field>
            <Field label="Office email">
              <Input name="email" defaultValue={org.email ?? ""} />
            </Field>
            <Field label="Replies go to" hint="When a homeowner replies to an email.">
              <Input name="replyTo" defaultValue={org.replyTo ?? ""} />
            </Field>
            <Field label="Address">
              <Input name="address" defaultValue={org.address ?? ""} />
            </Field>
            <div className="rounded-xl bg-muted/60 p-4 sm:col-span-2">
              <p className="text-sm font-medium">Quiet hours</p>
              <p className="text-xs text-muted-foreground">Routine homeowner messages are held between these hours and released in the morning. Urgent messages always go out.</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-xs">
                <Field label="From (24h)">
                  <Input name="quietStart" type="number" min={0} max={23} defaultValue={org.quietStart} />
                </Field>
                <Field label="Until (24h)">
                  <Input name="quietEnd" type="number" min={0} max={23} defaultValue={org.quietEnd} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {tab === "staff" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {users.map((u) => (
              <Card key={u.id} className="p-4">
                <form action={saveUser} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="userId" value={u.id} />
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Avatar name={u.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {u.name} {u.id === user.id ? <span className="text-xs font-normal text-subtle">you</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_LABEL[u.role]} · {u.email}
                        {u.phone ? ` · ${fmtPhone(u.phone)}` : ""}
                      </p>
                    </div>
                    <Pill tone={u.role === "owner" ? "navy" : u.role === "admin" ? "blue" : "slate"}>{ROLE_LABEL[u.role]}</Pill>
                  </div>
                  <Field label="Name">
                    <Input name="name" defaultValue={u.name} />
                  </Field>
                  <Field label="Email">
                    <Input name="email" defaultValue={u.email} />
                  </Field>
                  <Field label="Role">
                    <Select name="role" defaultValue={u.role}>
                      <option value="owner">Principal</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Office</option>
                    </Select>
                  </Field>
                  <Field label="Mobile">
                    <Input name="phone" defaultValue={u.phone ?? ""} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Toggle name="notifySms" defaultChecked={u.notifySms} label="Text me alerts" description="No-shows, urgent flags, and owner replies, per the automation rules." />
                  </div>
                  <div className="flex items-center justify-between sm:col-span-2">
                    {u.id !== user.id ? (
                      <button type="submit" formAction={removeUser} className="text-xs text-muted-foreground hover:text-danger">
                        Remove
                      </button>
                    ) : (
                      <span />
                    )}
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-5">
            <Card className="p-4">
              <p className="text-sm font-semibold">Add a staff member</p>
              <p className="text-xs text-muted-foreground">Principals see everything. Admins approve reports. Office staff schedule and approve too, but cannot change settings.</p>
              <form action={saveUser} className="mt-3 grid gap-3">
                <Field label="Name">
                  <Input name="name" required placeholder="Lauren Pike" />
                </Field>
                <Field label="Email">
                  <Input name="email" type="email" required placeholder="lauren@bluedoorbuilding.com" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role">
                    <Select name="role" defaultValue="staff">
                      <option value="admin">Admin</option>
                      <option value="staff">Office</option>
                      <option value="owner">Principal</option>
                    </Select>
                  </Field>
                  <Field label="Mobile">
                    <Input name="phone" placeholder="(561) 555-0103" />
                  </Field>
                </div>
                <Field label="Access code" hint="They sign in with their email and this code.">
                  <Input name="code" type="password" placeholder="••••••••" />
                </Field>
                <Toggle name="notifySms" defaultChecked label="Text them alerts" />
                <Button type="submit">Add</Button>
              </form>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "delivery" ? (
        <div className="max-w-2xl space-y-4">
          <Card>
            <CardHeader title="Text and email delivery" description="Messages are composed and logged by this system and sent through the delivery provider." />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <span className={cn("h-2.5 w-2.5 rounded-full", deliveryEnabled() ? "bg-success" : "bg-warning")} />
                <div>
                  <p className="text-sm font-medium">{deliveryEnabled() ? "Connected" : "Demo mode"}</p>
                  <p className="text-xs text-muted-foreground">{deliveryEnabled() ? "Texts and emails are going out." : "Every message is logged in the Outbox and marked skipped. Add the provider key to deliver for real."}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Texts come from a registered business number so carriers deliver them.</li>
                <li>Emails come from a Bluedoor address and replies land in the office inbox.</li>
                <li>Homeowner replies by text are matched to their open decision automatically.</li>
              </ul>
            </div>
          </Card>
          <Card>
            <CardHeader title="Photo storage" description="Vendor photos are compressed on their phone before upload, then stored with the visit." />
            <div className="px-5 pb-5 text-sm text-muted-foreground">Photos stay attached to the house forever. The homeowner’s page and email show them at full size.</div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

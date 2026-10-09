import { requireUser } from "@/lib/auth";
import { listRules, getOrg } from "@/lib/queries";
import { PageHeader, Card, Pill, Button, Notice, Select, Input } from "@/components/ui/primitives";
import { toggleRule, updateRule } from "@/lib/actions/directory";
import { runAutomationsNow } from "@/lib/actions/visits";
import { relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Zap, Clock, Play } from "lucide-react";

export const metadata = { title: "Automations" };

const RECIPIENTS: Record<string, string> = { office: "the office", owner_user: "Siobhan", vendor: "the vendor", homeowner: "the homeowner" };

export default async function AutomationsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const [rules, org] = await Promise.all([listRules(user.orgId), getOrg()]);
  const events = rules.filter((r) => r.trigger === "event");
  const clocks = rules.filter((r) => r.trigger === "schedule");
  let summary: { rule: string; message: string }[] = [];
  try {
    summary = sp.summary ? JSON.parse(decodeURIComponent(sp.summary)) : [];
  } catch {}
  const lastRan = rules.map((r) => r.lastRanAt).filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];
  const quietLabel = `${org.quietStart > 12 ? org.quietStart - 12 : org.quietStart} pm to ${org.quietEnd} am`;

  return (
    <div>
      <PageHeader
        eyebrow="Automations"
        title="Rules that run the day"
        description="Reminders, alerts, and escalations. Turn any rule off or change its timing."
        actions={
          <form action={runAutomationsNow}>
            <Button type="submit" variant="outline">
              <Play className="h-4 w-4" /> Run the clock now
            </Button>
          </form>
        }
      />
      {sp.ran !== undefined ? (
        <div className="mb-6">
          <Notice tone={Number(sp.ran) ? "green" : "blue"} title={Number(sp.ran) ? `${sp.ran} ${Number(sp.ran) === 1 ? "action" : "actions"} taken` : "Checked everything, nothing needed doing"}>
            {summary.length ? (
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {summary.map((s, n) => (
                  <li key={n}>{s.message}</li>
                ))}
              </ul>
            ) : (
              "Reminders, no-shows, unapproved reports, unanswered decisions, held messages, and overdue recurring services were all checked."
            )}
          </Notice>
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">When something happens</h2>
          <span className="text-xs text-subtle">fires instantly</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.map((r) => (
            <RuleCard key={r.id} rule={r} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">On the clock</h2>
          <span className="text-xs text-subtle">{lastRan ? `last ran ${relTime(lastRan)}` : "runs every hour"}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clocks.map((r) => (
            <RuleCard key={r.id} rule={r} quiet={r.key === "quiet_hours" ? quietLabel : undefined} />
          ))}
        </div>
      </section>
    </div>
  );
}

function RuleCard({ rule, quiet }: { rule: Awaited<ReturnType<typeof listRules>>[number]; quiet?: string }) {
  const c = rule.config;
  const tunable = c.hours !== undefined || c.minutes !== undefined || c.days !== undefined;
  const numberField = (name: "hours" | "minutes" | "days", value: number) => <Input name={name} type="number" defaultValue={value} className="!h-8 !w-14 px-2 text-center" />;
  return (
    <Card className={cn("flex flex-col p-4", !rule.enabled && "opacity-60")}>
      <div className="flex items-start gap-3">
        <form action={toggleRule} className="mt-0.5">
          <input type="hidden" name="ruleId" value={rule.id} />
          <button type="submit" role="switch" aria-checked={rule.enabled} className={cn("inline-flex h-5 w-9 items-center rounded-full p-0.5 transition", rule.enabled ? "bg-primary" : "bg-border")} title={rule.enabled ? "Turn off" : "Turn on"}>
            <span className={cn("h-4 w-4 rounded-full bg-white shadow transition", rule.enabled && "translate-x-4")} />
          </button>
        </form>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{rule.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {c.recipient ? <Pill tone="slate">to {RECIPIENTS[c.recipient] ?? c.recipient}</Pill> : null}
            {c.channel ? <Pill tone="blue">{c.channel === "both" ? "text + email" : c.channel === "sms" ? "text" : "email"}</Pill> : null}
            {quiet ? <Pill tone="slate">{quiet}</Pill> : null}
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-snug text-muted-foreground">{rule.description}</p>
      {tunable ? (
        <form action={updateRule} className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-2 pt-3 text-xs text-muted-foreground">
          <input type="hidden" name="ruleId" value={rule.id} />
          <input type="hidden" name="enabled" value="on" />
          {rule.key === "vendor_dispatch" && c.hours !== undefined ? (
            <>
              <span>remind</span>
              {numberField("hours", c.hours)}
              <span>hour{c.hours === 1 ? "" : "s"} before</span>
            </>
          ) : rule.key === "unfiled_report" && c.hours !== undefined ? (
            <>
              <span>check at</span>
              {numberField("hours", c.hours)}
              <span>:00</span>
            </>
          ) : (
            <>
              <span>after</span>
              {c.minutes !== undefined ? numberField("minutes", c.minutes) : c.hours !== undefined ? numberField("hours", c.hours) : numberField("days", c.days ?? 1)}
              <span>{c.minutes !== undefined ? "minutes" : c.hours !== undefined ? "hours" : "days"}</span>
            </>
          )}
          {c.recipient ? (
            <Select name="recipient" defaultValue={c.recipient} className="!h-8 !w-auto py-0 pr-7 text-xs">
              <option value="office">to the office</option>
              <option value="owner_user">to Siobhan</option>
              <option value="vendor">to the vendor</option>
              <option value="homeowner">to the homeowner</option>
            </Select>
          ) : null}
          <Button type="submit" size="sm" variant="outline" className="ml-auto">
            Save
          </Button>
        </form>
      ) : null}
    </Card>
  );
}

import { requireUser } from "@/lib/auth";
import { navCounts } from "@/lib/queries";
import { Sidebar } from "./sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const counts = await navCounts(user.orgId);
  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <Sidebar user={{ name: user.name, role: user.role }} counts={counts} />
      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

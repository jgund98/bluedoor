import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/today");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[5fr_7fr]">
      <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo.png" alt="Bluedoor Building" width={44} height={44} className="h-11 w-11 rounded-full" priority />
          <div className="leading-tight">
            <p className="font-display text-base tracking-[0.14em]">BLUEDOOR</p>
            <p className="text-xs text-muted-foreground">Estate management</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="display text-3xl text-ink sm:text-4xl">Sign in</h1>
          <p className="mt-2 text-base text-muted-foreground">Home office access.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
        <p className="text-sm text-subtle">Vendors and homeowners receive private links by text or email. They do not sign in here.</p>
      </section>
      <section className="relative hidden lg:block">
        <Image src="/estates/estate-palms.jpg" alt="" fill priority className="object-cover" sizes="60vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/70 via-abyss/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-porcelain">
          <p className="eyebrow text-porcelain/70">Casa Palma · Manalapan</p>
        </div>
      </section>
    </div>
  );
}

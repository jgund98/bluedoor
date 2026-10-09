export const dynamic = "force-dynamic";

/* The estate-management portal lives on the same domain as the site, under
   its own chrome. Everything inside is scoped by the .portal class. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="portal min-h-dvh bg-background text-foreground">{children}</div>;
}

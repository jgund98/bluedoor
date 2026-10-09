export const dynamic = "force-dynamic";

/* The estate-management portal lives on the same domain as the site, under
   its own chrome. Everything inside is scoped by the .estate-app class. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="estate-app min-h-dvh bg-background text-foreground">{children}</div>;
}

import InternalPageShell, { EditorialCTA, PageHero } from "../components/InternalPageShell.jsx";

export function CredentialsPage() {
  return (
    <InternalPageShell title="Credentials">
      <PageHero eyebrow="Credentials / Deferred" title="The credentials page is being assembled with verified evidence." intro="This route is intentionally reserved. Until the supporting records are ready, the résumé remains the authoritative credential document." meta="No fabricated certifications or claims" />
      <EditorialCTA eyebrow="Available now" title="Use the verified routes." actions={[{ label: "Open résumé", href: "/resume.pdf", external: true }, { label: "Read selected work", href: "/work" }]} />
    </InternalPageShell>
  );
}

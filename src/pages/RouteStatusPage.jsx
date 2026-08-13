import React from "react";
import InternalPageShell, { EditorialCTA, PageHero } from "../components/InternalPageShell.jsx";

export function CredentialsPage() {
  return (
    <InternalPageShell title="Credentials">
      <PageHero eyebrow="Credentials / Deferred" title="The credentials page is being assembled with verified evidence." intro="This route is intentionally reserved. Until the supporting records are ready, the résumé remains the authoritative credential document." meta="No fabricated certifications or claims" />
      <EditorialCTA eyebrow="Available now" title="Use the verified routes." actions={[{ label: "Open résumé", href: "/resume.pdf", external: true }, { label: "Read selected work", href: "/work" }]} />
    </InternalPageShell>
  );
}

export function NotFoundPage() {
  return (
    <InternalPageShell title="Page not found">
      <PageHero eyebrow="404 / Route not found" title="This page is outside the current mission path." intro="The address does not match an implemented portfolio route. Return home or continue to the selected work." meta={window.location.pathname} />
      <EditorialCTA eyebrow="Recover" title="Choose a verified destination." actions={[{ label: "Return home", href: "/" }, { label: "View work", href: "/work" }]} />
    </InternalPageShell>
  );
}

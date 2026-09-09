import { Suspense, lazy, useEffect } from "react";
import { getRouteSeo, normalizePagePath } from "./config/seo.js";
import { CredentialsPage } from "./pages/RouteStatusPage.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const WorkPage = lazy(() => import("./pages/WorkPage.jsx"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage.jsx"));
const BeyondPage = lazy(() => import("./pages/BeyondPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

const PAGE_ROUTES = {
  "/about": AboutPage,
  "/work": WorkPage,
  "/projects": ProjectsPage,
  "/beyond": BeyondPage,
  "/credentials": CredentialsPage,
};

function RouteLoader() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading__mark" aria-hidden="true">CM</div>
      <div className="route-loading__copy">
        <span>Loading portfolio</span>
        <span className="route-loading__line" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}

export default function App() {
  const path = normalizePagePath(window.location.pathname);
  useEffect(() => {
    document.title = getRouteSeo(path).title;
  }, [path]);
  const Page = PAGE_ROUTES[path];

  let content;

  if (Page) content = <Page />;
  else if (path === "/") content = <HomePage />;
  else content = <NotFoundPage />;

  return (
    <Suspense fallback={<RouteLoader />}>
      {content}
    </Suspense>
  );
}

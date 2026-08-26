import React, { Suspense, lazy } from "react";
import { CredentialsPage, NotFoundPage } from "./pages/RouteStatusPage.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const WorkPage = lazy(() => import("./pages/WorkPage.jsx"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage.jsx"));
const BeyondPage = lazy(() => import("./pages/BeyondPage.jsx"));
const StrikeCompanion = lazy(() => import("./components/StrikeCompanion.jsx"));

const PAGE_ROUTES = {
  "/about": AboutPage,
  "/work": WorkPage,
  "/projects": ProjectsPage,
  "/beyond": BeyondPage,
  "/credentials": CredentialsPage,
};

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const Page = PAGE_ROUTES[path];

  let content;

  if (Page) content = <Page />;
  else if (path === "/") content = <HomePage />;
  else content = <NotFoundPage />;

  return (
    <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading page" />}>
      {content}
      {path !== "/" ? <StrikeCompanion /> : null}
    </Suspense>
  );
}

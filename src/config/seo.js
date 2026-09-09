// Shared by the HTML build and the browser title update.
export const ROUTE_SEO = {
  "/": {
    title: "Chetan's Portfolio",
    description: "Explore Chetan Mandiga's portfolio: data science, machine learning, and software engineering projects, with case studies, technical evidence, and a downloadable resume.",
  },
  "/about": {
    title: "About Chetan Mandiga | Background & Experience",
    description: "Get to know Chetan Mandiga: education, technical interests, and the experiences behind his approach to data science and software engineering.",
  },
  "/work": {
    title: "Work | Chetan Mandiga",
    description: "Explore Chetan Mandiga's selected work through project case studies, implementation details, and visual evidence of the systems he builds.",
  },
  "/projects": {
    title: "Projects | Chetan Mandiga",
    description: "Browse Chetan Mandiga's data science, machine learning, and software projects, including technical context and links to inspect the work.",
  },
  "/beyond": {
    title: "Beyond the Work | Chetan Mandiga",
    description: "A personal look beyond Chetan Mandiga's technical work: space, Gundam, stories, building, and photographs from his personal archive.",
  },
  "/credentials": {
    title: "Credentials | Chetan Mandiga",
    description: "Chetan Mandiga's credentials page is being assembled. View the current resume for his background and experience.",
    noindex: true,
  },
};

export const NOT_FOUND_SEO = {
  title: "Page Not Found | Chetan Mandiga",
  description: "This page isn't here. Explore the Gundam playground or return to Chetan Mandiga's portfolio.",
  noindex: true,
};

export function normalizePagePath(pathname = "/") {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/index\.html$/, "/");
  return path.replace(/\/$/, "") || "/";
}

export function getRouteSeo(pathname) {
  const path = normalizePagePath(pathname);
  return Object.hasOwn(ROUTE_SEO, path) ? ROUTE_SEO[path] : NOT_FOUND_SEO;
}

import React from "react";
import clsx from "clsx";
import { HOME_TARGETS, scrollToStageProgress } from "../config/home.js";
import styles from "./FloatingDock.module.css";

const ICON_PATHS = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </>
  ),
  work: (
    <>
      <path d="M3 6h7l2 2h9v11H3z" />
      <path d="M3 10h18" />
    </>
  ),
  resume: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 12h6M9 16h6" />
    </>
  ),
  ask: (
    <>
      <path d="M4 4h16v13H9l-5 4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

function DockIcon({ name }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

const BASE_ITEMS = [
  {
    id: "home",
    label: "Home",
    onSelect: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
  {
    id: "work",
    label: "Work",
    onSelect: () => scrollToStageProgress(HOME_TARGETS.work),
  },
  { id: "resume", label: "Résumé", href: "/resume.pdf", external: true },
  {
    id: "contact",
    label: "Contact",
    onSelect: () => scrollToStageProgress(HOME_TARGETS.contact),
  },
];

export default function FloatingDock({ visible = false, onOpenAssistant }) {
  const items = onOpenAssistant
    ? [
        ...BASE_ITEMS.slice(0, 3),
        { id: "ask", label: "Ask me", onSelect: onOpenAssistant },
        BASE_ITEMS[3],
      ]
    : BASE_ITEMS;

  return (
    <nav
      className={clsx(styles.wrapper, visible && styles.visible)}
      aria-label="Quick navigation"
      aria-hidden={!visible}
      inert={visible ? undefined : ""}
    >
      <div className={styles.dock}>
        {items.map((item) => {
          const content = (
            <>
              <DockIcon name={item.id} />
              <span className={styles.tooltip}>{item.label}</span>
            </>
          );

          if (item.href) {
            return (
              <a
                key={item.id}
                className={styles.item}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                tabIndex={visible ? 0 : -1}
                aria-label={`${item.label}${item.external ? " (opens in a new tab)" : ""}`}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={styles.item}
              onClick={item.onSelect}
              tabIndex={visible ? 0 : -1}
              aria-label={item.label}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

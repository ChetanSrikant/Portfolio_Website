import React, { useRef } from "react";
import clsx from "clsx";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "./FloatingDock.module.css";

const ICON_PATHS = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  about: <><circle cx="12" cy="8" r="3" /><path d="M5 21c.7-4.4 3-6.5 7-6.5s6.3 2.1 7 6.5" /></>,
  work: <><path d="M3 6h7l2 2h9v11H3z" /><path d="M3 10h18" /></>,
  projects: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  beyond: <><circle cx="12" cy="12" r="8" /><path d="m9 15 2-6 4 4-6 2Z" /></>,
  resume: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
  ask: <><path d="M4 4h16v13H9l-5 4z" /><path d="M8 9h8M8 13h5" /></>,
};

const BASE_ITEMS = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "work", label: "Work", href: "/work" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "beyond", label: "Beyond", href: "/beyond" },
  { id: "resume", label: "Résumé", href: "/resume.pdf", external: true },
];

function DockIcon({ name }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON_PATHS[name]}</svg>;
}

function DockItem({ item, visible, mouseX }) {
  const ref = useRef(null);
  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect();
    return bounds ? value - bounds.left - bounds.width / 2 : 500;
  });
  const size = useSpring(useTransform(distance, [-140, 0, 140], [42, 62, 42]), { stiffness: 260, damping: 22, mass: .2 });
  const iconSize = useSpring(useTransform(distance, [-140, 0, 140], [18, 27, 18]), { stiffness: 260, damping: 22, mass: .2 });
  const content = <><motion.span className={styles.icon} style={{ width: iconSize, height: iconSize }}><DockIcon name={item.id} /></motion.span><span className={styles.tooltip}>{item.label}</span></>;
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  return (
    <motion.div ref={ref} className={styles.itemWrap} style={{ width: size, height: size }}>
      {item.href ? (
        <a className={styles.item} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} tabIndex={visible ? 0 : -1} aria-current={!item.external && currentPath === item.href ? "page" : undefined} aria-label={`${item.label}${item.external ? " (opens in a new tab)" : ""}`}>{content}</a>
      ) : (
        <button type="button" className={styles.item} onClick={item.onSelect} tabIndex={visible ? 0 : -1} aria-label={item.label}>{content}</button>
      )}
    </motion.div>
  );
}

export default function FloatingDock({ visible = false, onOpenAssistant }) {
  const mouseX = useMotionValue(10000);
  const items = onOpenAssistant
    ? [...BASE_ITEMS.slice(0, 5), { id: "ask", label: "Ask me", onSelect: onOpenAssistant }, BASE_ITEMS[5]]
    : BASE_ITEMS;

  return (
    <nav className={clsx(styles.wrapper, visible && styles.visible)} aria-label="Quick navigation" aria-hidden={!visible} inert={visible ? undefined : ""}>
      <div className={styles.dock} onMouseMove={(event) => mouseX.set(event.clientX)} onMouseLeave={() => mouseX.set(10000)}>
        {items.map((item) => <DockItem key={item.id} item={item} visible={visible} mouseX={mouseX} />)}
      </div>
    </nav>
  );
}

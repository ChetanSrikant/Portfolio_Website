import React from "react";
import styles from "./Footer.module.css";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/ChetanSrikant" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/",
  },
  { label: "Email", href: "mailto:chetansrikantmandiga@gmail.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <strong>Chetan Mandiga</strong>
        <span>AI developer · Product builder</span>
      </div>

      <div className={styles.meta}>
        <span>© {year} Chetan Mandiga</span>
        <span>Fan-made ZGMF-X09A presentation. Not affiliated with Sunrise or Bandai.</span>
      </div>

      <nav className={styles.links} aria-label="Social links">
        {SOCIALS.map((social) => (
          <a
            key={social.label}
            className={styles.link}
            href={social.href}
            target={social.href.startsWith("http") ? "_blank" : undefined}
            rel={social.href.startsWith("http") ? "noreferrer" : undefined}
          >
            {social.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

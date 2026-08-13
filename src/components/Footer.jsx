import React from "react";
import styles from "./Footer.module.css";

const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Selected work", href: "/work" },
    ],
  },
  {
    title: "Journey",
    links: [
      { label: "Projects", href: "/projects" },
      { label: "Beyond", href: "/beyond" },
      { label: "Playground", href: "/#final-playground" },
    ],
  },
  {
    title: "Connect",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ChetanSrikant",
        external: true,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/",
        external: true,
      },
      { label: "Résumé", href: "/resume.pdf", external: true },
    ],
  },
];

function FooterLink({ link }) {
  const content = (
    <>
      <span>{link.label}</span>
      <span className={styles.linkArrow} aria-hidden="true">
        ↗
      </span>
    </>
  );

  if (link.action) {
    return (
      <button type="button" className={styles.link} onClick={link.action}>
        {content}
      </button>
    );
  }

  return (
    <a
      className={styles.link}
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  );
}

export default function Footer({ showGundamDisclaimer = true }) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.gridScene} aria-hidden="true">
        <div className={styles.perspectiveGrid} />
        <div className={styles.gridFade} />
      </div>

      <div className={styles.inner}>
        <div className={styles.top}>
          <section className={styles.statement} aria-labelledby="footer-title">
            <span className={styles.eyebrow}>// Next step</span>
            <h2 id="footer-title" className={styles.title}>
              Build useful systems.
              <br />
              Explain the evidence clearly.
            </h2>
            <p className={styles.description}>
              Open to software engineering, AI application, backend, and
              automation opportunities.
            </p>
            <a
              className={styles.contactAction}
              href="mailto:chetansrikantmandiga@gmail.com?subject=Let%27s%20build%20something"
            >
              <span>Start a conversation</span>
              <span className={styles.actionArrow} aria-hidden="true">
                ↗
              </span>
            </a>
          </section>

          <nav className={styles.navigation} aria-label="Footer navigation">
            {FOOTER_GROUPS.map((group) => (
              <div className={styles.group} key={group.title}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <ul className={styles.linkList}>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <div className={styles.identity}>
            <span className={styles.name}>Chetan Srikant Mandiga</span>
            <span className={styles.role}>
              Software, systems, automation, and applied AI.
            </span>
          </div>

          <div className={styles.meta}>
            <span>© {year}</span>
            <span className={styles.metaDot} aria-hidden="true">•</span>
            <span>Built with curiosity.</span>
          </div>
        </div>

        {showGundamDisclaimer && (
          <p className={styles.disclaimer}>
            Fan-made ZGMF-X09A presentation. Not affiliated with Sunrise or Bandai.
          </p>
        )}
      </div>
    </footer>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./StoryScroll.module.css";

// A restrained version of the supplied bottom-left story-page turn.
export function FlowSection({ children, className = "", ...props }) {
  const target = useRef(null);
  const [active, setActive] = useState(false);
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "start 25%"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  useEffect(() => {
    const media = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    const update = () => setActive(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return <section ref={target} className={`${styles.section} ${className}`} {...props}>
    <motion.div className={styles.inner} style={{ rotate: active ? rotate : 0, y: active ? y : 0 }}>{children}</motion.div>
  </section>;
}

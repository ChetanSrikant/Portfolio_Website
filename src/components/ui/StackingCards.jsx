// Adapted from the stacking-cards pattern by Khoa Phan (pldkhoa.dev).
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./StackingCards.module.css";

const StackContext = createContext(null);

export default function StackingCards({ children, totalCards, className = "", scaleMultiplier = .018 }) {
  const target = useRef(null);
  const [active, setActive] = useState(false);
  const { scrollYProgress } = useScroll({ target, offset: ["start 100px", "end end"] });
  useEffect(() => {
    const media = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    const update = () => setActive(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return <StackContext.Provider value={{ progress: scrollYProgress, active, totalCards, scaleMultiplier }}>
    <div ref={target} className={`${styles.stack} ${className}`} data-stacking={active}>{children}</div>
  </StackContext.Provider>;
}

export function StackingCardItem({ index, children }) {
  const context = useContext(StackContext);
  if (!context) throw new Error("StackingCardItem must be inside StackingCards");
  const { progress, active, totalCards, scaleMultiplier } = context;
  const scale = useTransform(progress, [index / totalCards, 1], [1, 1 - (totalCards - index - 1) * scaleMultiplier]);
  return <div className={styles.item} style={{ top: active ? 100 + index * 18 : undefined, zIndex: index + 1 }}>
    <motion.div className={styles.surface} style={{ scale: active ? scale : 1 }}>{children}</motion.div>
  </div>;
}

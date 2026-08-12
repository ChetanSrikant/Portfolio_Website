import React from "react";
import { motion } from "framer-motion";

/**
 * Splits text into words, revealing them with a staggered rise + blur-in.
 * Triggers once when scrolled into view. Used for headline moments across
 * the page (hero, section intros, the philosophy line).
 */
export default function SplitReveal({
  text,
  as: Tag = "span",
  id,
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
  amount = 0.6,
}) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const word = {
    hidden: { y: "0.9em", opacity: 0, filter: "blur(6px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Tag id={id} className={className} style={{ display: "block" }}>
      <motion.span
        style={{ display: "inline" }}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
          >
            <motion.span
              style={{ display: "inline-block" }}
              variants={word}
            >
              {w}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

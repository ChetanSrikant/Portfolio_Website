import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?/<>[]{}";

function getRevealOrder(text, direction) {
  const indices = Array.from(text, (_, index) => index).filter(
    (index) => text[index] !== " "
  );

  if (direction === "end") return indices.reverse();
  if (direction !== "center") return indices;

  const center = (text.length - 1) / 2;
  return indices.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 14,
  characters = DEFAULT_CHARACTERS,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "restart",
  revealDirection = "start",
}) {
  const [frame, setFrame] = useState(() =>
    Array.from(text, (character) => ({ character, revealed: true }))
  );
  const [animating, setAnimating] = useState(false);
  const rootRef = useRef(null);
  const timerRef = useRef(null);
  const iterationRef = useRef(0);
  const revealOrder = useMemo(
    () => getRevealOrder(text, revealDirection),
    [revealDirection, text]
  );

  const stop = useCallback((reveal = true) => {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
    setAnimating(false);
    if (reveal) {
      setFrame(Array.from(text, (character) => ({ character, revealed: true })));
    }
  }, [text]);

  const start = useCallback(() => {
    window.clearInterval(timerRef.current);
    iterationRef.current = 0;
    setAnimating(true);

    timerRef.current = window.setInterval(() => {
      iterationRef.current += 1;
      const progress = Math.min(1, iterationRef.current / maxIterations);
      const revealedCount = Math.floor(progress * revealOrder.length);
      const revealed = new Set(revealOrder.slice(0, revealedCount));

      setFrame(
        Array.from(text, (character, index) => {
          if (character === " " || revealed.has(index)) {
            return { character, revealed: true };
          }

          return {
            character: characters[Math.floor(Math.random() * characters.length)],
            revealed: false,
          };
        })
      );

      if (progress >= 1) stop(true);
    }, speed);
  }, [characters, maxIterations, revealOrder, speed, stop, text]);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  useEffect(() => {
    if (animateOn !== "view") return undefined;
    const element = rootRef.current;
    if (!element) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stop(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        start();
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animateOn, start, stop]);

  const interactionProps =
    animateOn === "hover"
      ? { onMouseEnter: start }
      : animateOn === "click"
        ? {
            onClick: () => {
              if (clickMode === "toggle" && animating) stop(true);
              else start();
            },
            role: "button",
            tabIndex: 0,
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") start();
            },
          }
        : {};

  return (
    <span
      ref={rootRef}
      className={parentClassName}
      aria-label={text}
      {...interactionProps}
    >
      <span aria-hidden="true">
        {frame.map((item, index) => (
          <span
            key={`${index}-${item.character}`}
            className={item.revealed ? className : encryptedClassName}
          >
            {item.character}
          </span>
        ))}
      </span>
    </span>
  );
}

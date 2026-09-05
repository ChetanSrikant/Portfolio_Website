import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProgressiveImage } from "./ZoomParallax.jsx";
import styles from "./HorizontalScrollCarousel.module.css";

export function HorizontalScrollCarousel({ images }) {
  const targetRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    const update = () => setAnimated(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const measure = () => setTravel(Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth));
    const observer = new ResizeObserver(measure);
    observer.observe(trackRef.current);
    observer.observe(viewportRef.current);
    measure();
    return () => observer.disconnect();
  }, [animated, images]);

  const navigate = event => {
    if (!animated || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const start = targetRef.current.getBoundingClientRect().top + window.scrollY;
    const step = Math.min(450, window.innerWidth * .7);
    const destination = event.key === "Home" ? start : event.key === "End" ? start + travel
      : window.scrollY + (event.key === "ArrowRight" ? step : -step);
    window.scrollTo({ top: Math.min(start + travel, Math.max(start, destination)), behavior: "auto" });
  };

  return (
    <div ref={targetRef} className={styles.root} data-animated={animated} style={{ height: animated ? `calc(100dvh + ${travel}px)` : "auto" }}>
      <div ref={viewportRef} className={styles.viewport} role="region" aria-label="Personal archive photographs" tabIndex={0} onKeyDown={navigate}>
        <span className={styles.hint}>{animated ? "Scroll to explore / ← → keys" : "Swipe / scroll to explore"}</span>
        <motion.div ref={trackRef} className={styles.track} style={{ x: animated ? x : 0 }}>
          {images.map(image => (
            <figure key={image.src} className={styles.figure} data-kind={image.caption.toLowerCase()}>
              <div className={styles.frame}>
                <ProgressiveImage src={image.src} placeholder={image.placeholder} alt={image.alt} width={image.width} height={image.height} />
              </div>
              <figcaption><span>{image.caption}</span><span>{image.meta}</span></figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

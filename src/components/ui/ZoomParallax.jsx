import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import styles from "./ZoomParallax.module.css";

const SCALE_TARGETS = [3.7, 4.8, 3.3, 5.2, 4.6, 4.1, 3.5];

function useCompactLayout() {
  const [isCompact, setIsCompact] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches
  ));

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setIsCompact(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isCompact;
}

export function ProgressiveImage({
  src,
  placeholder,
  alt,
  width,
  height,
  loading = "lazy",
  className = "",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    setIsLoaded(Boolean(imageRef.current?.complete && imageRef.current?.naturalWidth));
  }, [src]);

  return (
    <span
      className={`${styles.progressiveImage} ${isLoaded ? styles.imageLoaded : ""} ${className}`}
      style={{ "--image-placeholder": placeholder ? `url(${placeholder})` : "none" }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </span>
  );
}

function StaticGallery({ images }) {
  return (
    <div className={styles.staticGallery} aria-label="Personal photograph collection">
      {images.map((image, index) => (
        <figure key={image.src} className={styles.staticFigure} data-index={index}>
          <ProgressiveImage
            src={image.src}
            placeholder={image.placeholder}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
          />
          {image.caption ? <figcaption>{image.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}

export default function ZoomParallax({ images = [], id }) {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isCompact = useCompactLayout();
  const selectedImages = images.slice(0, SCALE_TARGETS.length);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale0 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[0]]);
  const scale1 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[1]]);
  const scale2 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[2]]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[3]]);
  const scale4 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[4]]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[5]]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, SCALE_TARGETS[6]]);
  const scales = [scale0, scale1, scale2, scale3, scale4, scale5, scale6];
  const captionOpacity = useTransform(scrollYProgress, [0, 0.52, 0.72, 0.92, 1], [0, 0, 1, 1, 0]);
  const exitOpacity = useTransform(scrollYProgress, [0, 0.84, 1], [0, 0, 1]);

  if (prefersReducedMotion || isCompact) {
    return (
      <section id={id} ref={containerRef} className={styles.staticRoot} aria-label="Life outside the viewport photographs">
        <StaticGallery images={selectedImages} />
      </section>
    );
  }

  return (
    <section id={id} ref={containerRef} className={styles.root} aria-label="Life outside the viewport photographs">
      <span className={styles.entryLabel}>Fragments / in motion</span>
      <div className={styles.stickyViewport}>
        <div className={styles.composition}>
          {selectedImages.map((image, index) => (
            <figure
              key={image.src}
              className={`${styles.tile} ${image.className || ""}`}
              data-index={index}
              data-layout={image.layout}
            >
              <motion.div className={styles.zoomPlane} style={{ scale: scales[index] }}>
                <ProgressiveImage
                  src={image.src}
                  placeholder={image.placeholder}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                />
              </motion.div>
              {image.caption ? (
                <motion.figcaption style={index === 0 ? { opacity: captionOpacity } : undefined}>
                  {image.caption}
                </motion.figcaption>
              ) : null}
            </figure>
          ))}
        </div>
        <motion.div className={styles.exitVeil} style={{ opacity: exitOpacity }} aria-hidden="true" />
      </div>
    </section>
  );
}

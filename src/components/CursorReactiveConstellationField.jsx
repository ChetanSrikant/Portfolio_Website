import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConstellationField } from "@designcodeio/threeui/components/ConstellationField";
import styles from "./CursorReactiveConstellationField.module.css";

const POINTER_MESSAGE = "portfolio:particle-pointer";
const BRIDGE_MARKER = "data-portfolio-pointer-bridge";

function patchParticleDriftSource(source) {
  if (!source || source.includes(BRIDGE_MARKER)) return source;

  const pointerBridge = `
<script ${BRIDGE_MARKER}>
(function () {
  window.addEventListener("message", function (event) {
    var payload = event.data;
    if (!payload || payload.type !== "${POINTER_MESSAGE}") return;

    window.dispatchEvent(new MouseEvent("mousemove", {
      clientX: payload.x,
      clientY: payload.y,
      bubbles: true
    }));

    if (!window.__portfolioPointerBridgeAcknowledged) {
      window.__portfolioPointerBridgeAcknowledged = true;
      window.parent.postMessage({ type: "${POINTER_MESSAGE}:ack" }, "*");
    }
  });
})();
</script>`;

  return source
    .replace(
      "g.addColorStop(0, `rgba(96, 165, 250, ${b.opacity})`);",
      "g.addColorStop(0, `rgba(210, 205, 190, ${Math.min(0.18, b.opacity * 0.35)})`);",
    )
    .replace(
      "ctx.strokeStyle = `rgba(156, 163, 175, ${0.15 * (1 - d/120)})`;",
      "ctx.strokeStyle = `rgba(210, 205, 190, ${0.08 * (1 - d/120)})`;",
    )
    .replace(
      "let dist = Math.hypot(mouse.x - n.x, mouse.y - n.y);",
      "let dist = Math.hypot(mouse.x - n.x, mouse.y - n.y); const strength = Math.max(0, 1 - dist / 180);",
    )
    .replace(
      "if (dist < 180 || Math.random() > 0.98) n.char = chars[Math.floor(Math.random() * chars.length)];",
      "if ((dist < 180 && Math.random() > 0.88) || Math.random() > 0.985) n.char = chars[Math.floor(Math.random() * chars.length)];",
    )
    .replace(
      "ctx.strokeStyle = `rgba(96, 165, 250, ${0.5 * (1 - dist/180)})`;",
      "ctx.strokeStyle = `rgba(224, 187, 99, ${strength * 0.45})`;",
    )
    .replace(
      "ctx.fillStyle = dist < 180 ? '#60A5FA' : 'rgba(156, 163, 175, 0.4)';",
      "ctx.fillStyle = dist < 180 ? '#e0bb63' : 'rgba(210, 205, 190, 0.28)';",
    )
    .replace(
      "ctx.fillText(n.char, n.x, n.y);",
      `if (dist < 180) {
                        ctx.save();
                        ctx.shadowColor = '#e0bb63';
                        ctx.shadowBlur = strength * 6;
                        ctx.fillText(n.char, n.x, n.y);
                        ctx.restore();
                    } else {
                        ctx.fillText(n.char, n.x, n.y);
                    }`,
    )
    .replace("</body>", `${pointerBridge}\n</body>`);
}

export default function CursorReactiveConstellationField({ reducedMotion = false }) {
  const hostRef = useRef(null);
  const iframeRef = useRef(null);
  const [patchedSource, setPatchedSource] = useState("");

  useLayoutEffect(() => {
    const iframe = hostRef.current?.querySelector('iframe[title="Particle Drift"]');
    const source = iframe?.getAttribute("srcdoc");
    if (!iframe || !source) return;

    setPatchedSource(patchParticleDriftSource(source));
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return undefined;

    let animationFrame = 0;
    let lastPointer = { clientX: -1000, clientY: -1000 };

    const sendPointer = () => {
      animationFrame = 0;
      const iframe = iframeRef.current;
      const targetWindow = iframe?.contentWindow;
      if (!iframe || !targetWindow) return;

      const rect = iframe.getBoundingClientRect();
      targetWindow.postMessage(
        {
          type: POINTER_MESSAGE,
          x: lastPointer.clientX - rect.left,
          y: lastPointer.clientY - rect.top,
        },
        "*",
      );
      if (!hostRef.current?.hasAttribute("data-pointer-sent")) {
        hostRef.current?.setAttribute("data-pointer-sent", "active");
      }
    };

    const schedulePointer = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(sendPointer);
    };

    const handlePointerMove = (event) => {
      lastPointer = { clientX: event.clientX, clientY: event.clientY };
      if (!hostRef.current?.hasAttribute("data-pointer-input")) {
        hostRef.current?.setAttribute("data-pointer-input", "active");
      }
      schedulePointer();
    };

    const clearPointer = () => {
      lastPointer = { clientX: -1000, clientY: -1000 };
      schedulePointer();
    };

    const handleBridgeMessage = (event) => {
      if (
        event.data?.type === `${POINTER_MESSAGE}:ack`
      ) {
        hostRef.current?.setAttribute("data-pointer-bridge", "active");
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", schedulePointer, { passive: true });
    window.addEventListener("resize", schedulePointer, { passive: true });
    window.addEventListener("blur", clearPointer);
    window.addEventListener("pointercancel", clearPointer);
    window.addEventListener("message", handleBridgeMessage);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", schedulePointer);
      window.removeEventListener("resize", schedulePointer);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("pointercancel", clearPointer);
      window.removeEventListener("message", handleBridgeMessage);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.backdrop} aria-hidden="true">
      {patchedSource ? (
        <iframe
          ref={iframeRef}
          className={styles.field}
          title="Particle Drift"
          srcDoc={patchedSource}
          sandbox="allow-scripts"
          loading="eager"
        />
      ) : (
        <ConstellationField
          className={styles.field}
          variant="particle-drift"
          mode="dark"
          speed={reducedMotion ? 0 : 1}
          size={1}
          length={1}
          density={1}
          opacity={1}
          hue={0}
          saturation={1}
          brightness={1}
        />
      )}
    </div>
  );
}

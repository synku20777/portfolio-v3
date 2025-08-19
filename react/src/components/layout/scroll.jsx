import React, { useRef, useState, useCallback, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function SmoothScroll({
  children,
  stiffness = 160,
  damping = 28,
  mass = 0.28,
}) {
  const scrollRef = useRef(null);
  const [padTop, setPadTop] = useState(0);
  const [page, setPage] = useState({ height: 0, maxTranslate: 0 });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const headerEl = document.getElementById("site-header");
    const headerH = headerEl
      ? Math.ceil(headerEl.getBoundingClientRect().height)
      : 0;
    setPadTop(headerH);
    const contentHost = el.firstElementChild || el;
    const contentH =
      (contentHost.scrollHeight ||
        contentHost.getBoundingClientRect().height ||
        0) + headerH;
    const maxTranslate = Math.max(0, contentH - (window.innerHeight || 0));
    setPage({ height: contentH, maxTranslate });
  }, []);

  useLayoutEffect(() => {
    measure();
    let ro;
    const el = scrollRef.current;
    if (el && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }
    addEventListener("resize", measure, { passive: true });
    addEventListener("load", measure, { passive: true });
    const raf = requestAnimationFrame(measure);
    return () => {
      if (ro) ro.disconnect();
      removeEventListener("resize", measure);
      removeEventListener("load", measure);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  const { scrollY } = useScroll();
  const yRaw = useTransform(
    scrollY,
    (v) => -Math.max(0, Math.min(v, page.maxTranslate))
  );
  const y = useSpring(yRaw, {
    damping,
    stiffness,
    mass,
    restDelta: 0.0008,
    restSpeed: 0.0008,
  });

  return (
    <>
      <motion.div
        ref={scrollRef}
        style={{ y, "--header-h": padTop + "px" }}
        className="fixed inset-0 z-10 will-change-transform"
      >
        <div style={{ paddingTop: padTop }}>{children}</div>
      </motion.div>
      <div style={{ height: page.height }} />
    </>
  );
}

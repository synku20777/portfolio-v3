import React, {
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  createContext,
  useContext,
  useState,
} from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const PointerContext = createContext(null);
function usePointer() {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("PointerContext missing");
  return ctx;
}

function useViewportGrid(cell = 40) {
  const [dims, setDims] = useState({ cols: 0, rows: 0 });
  useEffect(() => {
    const m = () => {
      const w = innerWidth,
        h = innerHeight;
      setDims({
        cols: Math.max(1, Math.floor(w / cell)),
        rows: Math.max(1, Math.floor(h / cell)),
      });
    };
    m();
    addEventListener("resize", m);
    return () => removeEventListener("resize", m);
  }, [cell]);
  return dims;
}

function useElementCenter(ref) {
  const [c, setC] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = () => {
      const r = el.getBoundingClientRect();
      setC({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    m();
    addEventListener("resize", m);
    return () => removeEventListener("resize", m);
  }, [ref]);
  return c;
}

function Filing({ color = "#E5E7EB", thickness = 1 }) {
  const { x: px, y: py } = usePointer();
  const ref = useRef(null);
  const center = useElementCenter(ref);
  const rotate = useTransform(() => {
    if (!center) return 0;
    const dx = px.get() - center.x,
      dy = py.get() - center.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  });
  return (
    <motion.div
      ref={ref}
      className="mag-filing"
      style={{ rotate, backgroundColor: color, height: thickness }}
    />
  );
}

export default function MagneticBackground({
  cell = 40,
  color = "rgba(255,255,255,0.14)",
  thickness = 1,
}) {
  const { cols, rows } = useViewportGrid(cell);
  const total = useMemo(() => cols * rows, [cols, rows]);
  const px = useMotionValue(0),
    py = useMotionValue(0);
  useEffect(() => {
    const onMove = (e) => {
      px.set(e.clientX);
      py.set(e.clientY);
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [px, py]);
  return (
    <PointerContext.Provider value={{ x: px, y: py }}>
      <div className="magnetic-bg fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cols},1fr)`,
            gridTemplateRows: `repeat(${rows},1fr)`,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <Filing key={i} color={color} thickness={thickness} />
          ))}
        </div>
      </div>
      <style>{`.mag-filing{width:70%;border-radius:2px;justify-self:center;align-self:center;transform-origin:50% 50%;will-change:transform}@media (max-width:640px){.mag-filing{width:66%}}`}</style>
    </PointerContext.Provider>
  );
}

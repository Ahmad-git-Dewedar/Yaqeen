/*
 * Animated show/hide panels used for evidence disclosures and the FAQ.
 * Closed panels stay in the page (inert) so site search can still find them;
 * a search hit inside one opens it through the "yaqeen:reveal" event
 */
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 0.7, 0.2, 1];

export function useRevealOpen(ref, open) {
  useEffect(() => {
    const onReveal = (e) => {
      if (ref.current?.contains(e.detail)) open();
    };
    document.addEventListener("yaqeen:reveal", onReveal);
    return () => document.removeEventListener("yaqeen:reveal", onReveal);
  }, [ref, open]);
}

export function Panel({ id, open, className = "", children }) {
  return (
    <motion.div
      id={id}
      className={className}
      initial={false}
      animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.55, ease }}
      style={{ overflow: "hidden" }}
      inert={open ? undefined : ""}
    >
      {children}
    </motion.div>
  );
}

/** "Evidence" button that unfolds its proofs */
export function Disclosure({ label = "الدليل", children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panel = useRef(null);
  useRevealOpen(panel, () => setOpen(true));

  return (
    <>
      <button className="disclose" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        <svg className="icon" aria-hidden="true"><use href="#i-chevron" /></svg>
      </button>
      <div ref={panel}>
        <Panel id={id} open={open} className="disclose__panel">{children}</Panel>
      </div>
    </>
  );
}

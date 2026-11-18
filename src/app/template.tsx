"use client";

import { motion } from "framer-motion";

// Re-mounts on every navigation, so each page fades in. Opacity only: a transform
// here would re-anchor the pages' fixed backgrounds while it ran.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

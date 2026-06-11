import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

export default function Modal({ isOpen, onClose, title, children, size = "md", footer }) {
  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${sizeMap[size] || sizeMap.md} mx-4 flex flex-col max-h-[90vh] overflow-hidden z-50`}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-card)",
              borderRadius: "20px",
              boxShadow: "var(--shadow-modal)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border-divider)" }}
            >
              <h2
                className="text-[17px] font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer"
                style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-danger-bg)"; e.currentTarget.style.color = "var(--color-danger)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                <X size={15} weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-relaxed"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-ui)" }}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
                style={{ borderTop: "1px solid var(--border-divider)" }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

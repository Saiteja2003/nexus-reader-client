// src/components/SummarizeModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Summarize.module.css";

function SummarizeModal({ isOpen, onClose, summary, isLoading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.header}>
              <h3 className={styles.title}>AI Summary</h3>
              <button className={styles.closeButton} onClick={onClose}>
                <X />
              </button>
            </header>
            <div className={styles.content}>
              {isLoading ? <p>Generating summary...</p> : <p>{summary}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SummarizeModal;

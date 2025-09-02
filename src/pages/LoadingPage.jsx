import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import styles from "./LoadingPage.module.css";

function LoadingPage() {
  const { isAppReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAppReady) {
      // Use replace: true so the user can't click "back" to the loading screen
      navigate("/", { replace: true });
    }
  }, [isAppReady, navigate]);

  return (
    <div className={styles.loadingContainer}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.contentWrapper}
      >
        {/* This now uses your existing logo from the public folder */}
        <img
          src="/nr-icon-geometric.svg"
          alt="NexusReader Logo"
          className={styles.logo}
        />
        <h1 className={styles.title}>NexusReader</h1>
        <p className={styles.subtitle}>The best news aggregator online.</p>
      </motion.div>
    </div>
  );
}

export default LoadingPage;

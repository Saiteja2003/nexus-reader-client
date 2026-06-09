// src/components/ArticleView.jsx
import { Sparkles, ArrowUpRight, Star } from "lucide-react";
import styles from "./ArticleView.module.css";
import { motion } from "framer-motion";
// IMPORT the new Supabase named exports
import { saveArticle, unsaveArticle } from "../api";

function ArticleView({ selectedArticle, savedArticles, onRefreshSaved }) {
  if (!selectedArticle) {
    return (
      <div className={`${styles.articleView} ${styles.placeholder}`}>
        <p>Select an article to read</p>
      </div>
    );
  }

  const isSaved = savedArticles.some(
    (article) => article.link === selectedArticle.link,
  );

  const handleSave = async () => {
    try {
      // Use the new Supabase wrapper
      await saveArticle({
        title: selectedArticle.title,
        link: selectedArticle.link,
        pubDate: selectedArticle.pubDate,
        content: selectedArticle.content || selectedArticle.contentSnippet,
        feedTitle:
          selectedArticle.feedTitle || new URL(selectedArticle.link).hostname,
      });
      onRefreshSaved();
    } catch (error) {
      console.error("Failed to save article:", error);
      alert(error.message || "Could not save this article.");
    }
  };

  const handleUnsave = async () => {
    try {
      // Use the new Supabase wrapper
      await unsaveArticle(selectedArticle.link);
      onRefreshSaved();
    } catch (error) {
      console.error("Failed to unsave article:", error);
      alert("Could not unsave this article.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.article
      key={selectedArticle.guid || selectedArticle.link}
      className={styles.articleView}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.meta}>
            {selectedArticle.creator || "Source"} ·{" "}
            {formatDate(selectedArticle.pubDate)}
          </p>
          <h1 className={styles.title}>{selectedArticle.title}</h1>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            title={isSaved ? "Unsave Article" : "Save for Later"}
            onClick={isSaved ? handleUnsave : handleSave}
          >
            <Star size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <a
            href={selectedArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="View Original"
          >
            <ArrowUpRight size={20} />
          </a>
          <button className={styles.actionButton} title="Summarize with AI">
            <Sparkles size={20} />
          </button>
        </div>
      </header>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{
          __html: selectedArticle.content || selectedArticle.contentSnippet,
        }}
      />
    </motion.article>
  );
}

export default ArticleView;

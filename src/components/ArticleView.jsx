// src/components/ArticleView.jsx
import { Sparkles, ArrowUpRight, Star } from "lucide-react";
import styles from "./ArticleView.module.css";
import { motion } from "framer-motion";
import apiClient from "../api";

function ArticleView({ selectedArticle, savedArticles, onRefreshSaved }) {
  // If no article is selected, show a placeholder message

  if (!selectedArticle) {
    return (
      <div className={`${styles.articleView} ${styles.placeholder}`}>
        <p>Select an article to read</p>
      </div>
    );
  }
  // Check if the article is already saved
  const isSaved = savedArticles.some(
    (article) => article.link === selectedArticle.link
  );

  const handleSave = async () => {
    try {
      await apiClient.post("/api/articles/save", {
        title: selectedArticle.title,
        link: selectedArticle.link,
        pubDate: selectedArticle.pubDate,
        content: selectedArticle.content || selectedArticle.contentSnippet,
        feedTitle:
          selectedArticle.feedTitle || new URL(selectedArticle.link).hostname,
      });
      onRefreshSaved(); // Tell MainLayout to refresh the saved articles list
    } catch (error) {
      console.error("Failed to save article:", error);
      alert("Could not save this article.");
    }
  };

  const handleUnsave = async () => {
    try {
      await apiClient.delete(
        `/api/articles/unsave/${encodeURIComponent(selectedArticle.link)}`
      );
      onRefreshSaved(); // Refresh the list
    } catch (error) {
      console.error("Failed to unsave article:", error);
      alert("Could not unsave this article.");
    }
  };

  // A helper function to format the date
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
      key={selectedArticle.guid || selectedArticle.link} // Add key to re-trigger animation
      className={styles.articleView}
      initial={{ opacity: 0, y: 20 }} // Start invisible and slightly down
      animate={{ opacity: 1, y: 0 }} // Animate to fully visible and original position
      transition={{ duration: 0.5 }} // Control the speed of the animation
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

      {/* IMPORTANT: Rendering HTML Content Safely
        RSS feeds often contain HTML in their content. To render it, we use
        `dangerouslySetInnerHTML`. This is safe HERE because we are displaying
        content from trusted RSS feeds. We would NEVER use this for user-submitted content
        as it could lead to security vulnerabilities (XSS attacks).
      */}
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

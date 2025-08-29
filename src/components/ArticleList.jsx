// src/components/ArticleList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import styles from "./ArticleList.module.css";
import apiClient from "../api";

function ArticleList({ selectedFeed, selectedArticle, onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedFeed) {
      setArticles([]);
      return;
    }

    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/api/fetch-articles", {
          params: { url: selectedFeed.url },
        });

        // ✅ NEW: De-duplication logic
        const rawArticles = response.data.items || [];
        const seen = new Set(); // Keep track of links we've already seen

        const uniqueArticles = rawArticles.filter((article) => {
          const identifier = article.link || article.guid;
          if (seen.has(identifier)) {
            return false; // If we've seen this link before, filter it out
          } else {
            seen.add(identifier);
            return true; // Otherwise, keep it and add its link to the set
          }
        });

        setArticles(uniqueArticles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedFeed]);

  return (
    <div className={styles.articleList}>
      <header className={styles.header}>
        <h2>
          {isLoading ? (
            <Skeleton width={150} />
          ) : selectedFeed ? (
            selectedFeed.title
          ) : (
            "Articles"
          )}
        </h2>
      </header>

      <div>
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div className={styles.articleCard} key={index}>
                <h3 className={styles.cardTitle}>
                  <Skeleton />
                </h3>
                <p className={styles.cardSnippet}>
                  <Skeleton count={2} />
                </p>
              </div>
            ))
          : articles.map((article, index) => (
              <div
                key={article.guid || article.link + index}
                onClick={() => onSelectArticle(article)}
                className={`${styles.articleCard} ${
                  selectedArticle?.link === article.link ? styles.active : ""
                }`}
              >
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.cardSnippet}>
                  {article.contentSnippet?.substring(0, 100)}...
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}

export default ArticleList;

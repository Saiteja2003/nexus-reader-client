// src/components/ArticleList.jsx
import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import apiClient from "../api";
import { Star, Inbox } from "lucide-react";
import styles from "./ArticleList.module.css";

function EmptyState({ type }) {
  if (type === "readLater") {
    return (
      <div className={styles.emptyState}>
        <Star size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No Saved Articles</h3>
        <p className={styles.emptyText}>
          Click the star icon on an article to save it here for later.
        </p>
      </div>
    );
  }
  return (
    <div className={styles.emptyState}>
      <Inbox size={48} className={styles.emptyIcon} />
      <h3 className={styles.emptyTitle}>No Articles Found</h3>
      <p className={styles.emptyText}>
        This feed is currently empty or could not be loaded.
      </p>
    </div>
  );
}

function ArticleList({
  selectedFeed,
  selectedArticle,
  onSelectArticle,
  savedArticles,
}) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("Loading Articles...");

  useEffect(() => {
    const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    const loadArticles = async () => {
      setIsLoading(true);
      setArticles([]);

      if (selectedFeed?.id === "readLater") {
        setArticles(savedArticles || []);
        setIsLoading(false);
        return;
      }

      if (!selectedFeed) {
        setIsLoading(false);
        return;
      }

      // --- NEW CACHING LOGIC ---
      const cacheKey = `feed_cache_${selectedFeed.id || selectedFeed._id}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          console.log(`Loading '${selectedFeed.title}' from cache.`);
          setArticles(cachedArticles);
          setIsLoading(false);
          return; // Use the cached data and stop here
        }
      }
      // --- END OF CACHING LOGIC ---
      try {
        let rawArticles;
        if (selectedFeed.id === "all") {
          setLoadingTitle("Fetching subscribed feeds...");
          // This endpoint now correctly returns a list of FEEDs, not articles.
          const feedsResponse = await apiClient.get("/api/feeds/articles/all");
          const feedsToFetch = feedsResponse.data;

          if (feedsToFetch.length === 0) {
            setIsLoading(false);
            return;
          }

          let combinedArticles = [];
          for (const feed of feedsToFetch) {
            setLoadingTitle(`Fetching from ${feed.title}...`);
            try {
              // This call is now correct, as 'feed.url' will be defined.
              const articlesResponse = await apiClient.get(
                "/api/fetch-articles",
                { params: { url: feed.url } }
              );
              const newItems = (articlesResponse.data.items || []).map(
                (item) => ({ ...item, feedTitle: feed.title })
              );
              combinedArticles = [...combinedArticles, ...newItems];

              const seen = new Set();
              const uniqueArticles = combinedArticles
                .filter((article) => {
                  const identifier = article.link || article.guid;
                  if (!identifier || seen.has(identifier)) return false;
                  seen.add(identifier);
                  return true;
                })
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
              setArticles(uniqueArticles);
            } catch (fetchError) {
              console.error(
                `Failed to fetch articles for ${feed.title}:`,
                fetchError
              );
            }
          }
          rawArticles = combinedArticles;
        } else {
          // Logic for a single feed
          setLoadingTitle(`Fetching from ${selectedFeed.title}...`);
          const response = await apiClient.get("/api/fetch-articles", {
            params: { url: selectedFeed.url },
          });
          rawArticles = response.data.items || [];
          setArticles(rawArticles);
        }
        const seen = new Set();
        const uniqueArticles = rawArticles
          .filter((article) => {
            const identifier = article.link || article.guid;
            if (!identifier || seen.has(identifier)) return false;
            seen.add(identifier);
            return true;
          })
          .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        setArticles(uniqueArticles);

        console.log(`Saving '${selectedFeed.title}' to cache.`);
        const cachePayload = {
          articles: uniqueArticles,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cachePayload));
        // --- END OF CACHE SAVING LOGIC ---
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setIsLoading(false);
        setLoadingTitle("Loading Articles...");
      }
    };

    loadArticles();
  }, [selectedFeed, savedArticles]);

  return (
    <div className={styles.articleList}>
      <header className={styles.header}>
        <h2>
          {isLoading
            ? loadingTitle
            : selectedFeed
            ? selectedFeed.title
            : "Articles"}
        </h2>
      </header>

      <div>
        {isLoading && articles.length === 0 ? (
          Array.from({ length: 7 }).map((_, index) => (
            <div className={styles.articleCard} key={index}>
              <h3 className={styles.cardTitle}>
                <Skeleton />
              </h3>
              <p className={styles.cardSnippet}>
                <Skeleton count={2} />
              </p>
            </div>
          ))
        ) : !isLoading && articles.length === 0 ? (
          <EmptyState type={selectedFeed?.id} />
        ) : (
          articles.map((article, index) => (
            <div
              key={article.guid || article.link + index}
              onClick={() => onSelectArticle(article)}
              className={`${styles.articleCard} ${
                selectedArticle?.link === article.link ? styles.active : ""
              }`}
            >
              {(selectedFeed.id === "all" ||
                selectedFeed.id === "readLater") && (
                <p className={styles.cardSource}>
                  {article.feedTitle ||
                    (article.link && new URL(article.link).hostname)}
                </p>
              )}
              <h3 className={styles.cardTitle}>{article.title}</h3>
              <p className={styles.cardSnippet}>
                {article.contentSnippet?.substring(0, 100)}...
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ArticleList;

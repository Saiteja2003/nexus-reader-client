// src/pages/DiscoverPage.jsx
import { useState, useEffect } from "react";
import apiClient from "../api";
import styles from "./DiscoverPage.module.css";

// A smaller component for each feed card
function FeedCard({ feed, onSubscribe, isSubscribed }) {
  return (
    <div className={styles.feedCard}>
      <img
        src={`https://www.google.com/s2/favicons?domain=${
          new URL(feed.url).hostname
        }&sz=64`}
        alt={`${feed.title} favicon`}
        className={styles.favicon}
      />
      <div className={styles.feedInfo}>
        <h4 className={styles.feedTitle}>{feed.title}</h4>
        <a
          href={feed.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.feedLink}
        >
          {new URL(feed.url).hostname}
        </a>
      </div>
      <button
        onClick={() => onSubscribe(feed.url)}
        className={`${styles.subscribeButton} ${
          isSubscribed ? styles.subscribed : ""
        }`}
        disabled={isSubscribed}
      >
        {isSubscribed ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}

function DiscoverPage({ onFeedAdded, userFeeds }) {
  const [curatedFeeds, setCuratedFeeds] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Get a simple list of URLs the user is already subscribed to for quick checking
  const subscribedUrls = new Set(userFeeds.map((feed) => feed.url));

  useEffect(() => {
    const fetchCuratedFeeds = async () => {
      try {
        const response = await apiClient.get("/api/curated");
        setCuratedFeeds(response.data);
      } catch (error) {
        console.error("Failed to fetch curated feeds:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCuratedFeeds();
  }, []);

  const handleSubscribe = async (url) => {
    try {
      await apiClient.post("/api/feeds", { url });
      onFeedAdded(); // This tells MainLayout to refresh the user's feed list
    } catch (error) {
      alert(error.response?.data?.error || "Could not subscribe to this feed.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.discoverPage}>
        <h1 className={styles.pageTitle}>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.discoverPage}>
      <h1 className={styles.pageTitle}>Discover New Feeds</h1>

      {Object.entries(curatedFeeds).map(([category, feeds]) => (
        <section key={category} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>{category}</h2>
          <div className={styles.feedsGrid}>
            {feeds.map((feed) => (
              <FeedCard
                key={feed._id}
                feed={feed}
                onSubscribe={handleSubscribe}
                isSubscribed={subscribedUrls.has(feed.url)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default DiscoverPage;

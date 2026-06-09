// src/pages/DiscoverPage.jsx
import { useState, useEffect } from "react";
import { fetchCuratedFeeds, addFeed, deleteFeed } from "../api";
import { Plus, Check, Trash2, Compass } from "lucide-react";
import styles from "./DiscoverPage.module.css";

function FeedCard({ feed, onSubscribe, onUnsubscribe, subscribedFeedId }) {
  const isSubscribed = Boolean(subscribedFeedId);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.feedCard}>
      <div className={styles.cardHeader}>
        <div className={styles.faviconWrapper}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${
              new URL(feed.url).hostname
            }&sz=64`}
            alt=""
            className={styles.favicon}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className={styles.faviconFallback} style={{ display: "none" }}>
            {feed.title.charAt(0)}
          </div>
        </div>
        <div className={styles.feedInfo}>
          <h4 className={styles.feedTitle}>{feed.title}</h4>
          <span className={styles.feedLink}>{new URL(feed.url).hostname}</span>
        </div>
      </div>

      <button
        onClick={() =>
          isSubscribed ? onUnsubscribe(subscribedFeedId) : onSubscribe(feed.url)
        }
        className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : styles.unsubscribed}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSubscribed ? (
          isHovered ? (
            <>
              <Trash2 size={15} />
              <span>Unsubscribe</span>
            </>
          ) : (
            <>
              <Check size={15} className={styles.checkIcon} />
              <span>Subscribed</span>
            </>
          )
        ) : (
          <>
            <Plus size={15} />
            <span>Subscribe</span>
          </>
        )}
      </button>
    </div>
  );
}

function DiscoverPage({ onFeedAdded, userFeeds }) {
  const [curatedFeeds, setCuratedFeeds] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Map URLs to subscription IDs for instant tracking and un-subscribing actions
  const subscriptionMap = new Map(
    userFeeds.map((feed) => [feed.url, feed.id || feed._id]),
  );

  useEffect(() => {
    const loadCuratedFeeds = async () => {
      try {
        const data = await fetchCuratedFeeds();
        setCuratedFeeds(data);
      } catch (error) {
        console.error("Failed to fetch curated feeds:", error);
      }
      {
        setIsLoading(false);
      }
    };
    loadCuratedFeeds();
  }, []);

  const handleSubscribe = async (url) => {
    try {
      await addFeed(url);
      onFeedAdded();
    } catch (error) {
      alert(error.message || "Could not subscribe to this feed.");
    }
  };

  const handleUnsubscribe = async (feedId) => {
    try {
      await deleteFeed(feedId);
      onFeedAdded();
    } catch (error) {
      alert("Could not unsubscribe from this feed.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.discoverPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Curating your modern workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.discoverPage}>
      <header className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <Compass className={styles.headerIcon} size={28} />
          <h1 className={styles.pageTitle}>Discover Intelligence</h1>
        </div>
        <p className={styles.pageSubtitle}>
          Expand your knowledge workspace with reliable insights, tech
          transformations, and real-time market updates.
        </p>
      </header>

      {Object.entries(curatedFeeds).map(([category, feeds]) => (
        <section key={category} className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <div className={styles.titleLine} />
          </div>
          <div className={styles.feedsGrid}>
            {feeds.map((feed) => (
              <FeedCard
                key={feed.id || feed._id}
                feed={feed}
                onSubscribe={handleSubscribe}
                onUnsubscribe={handleUnsubscribe}
                subscribedFeedId={subscriptionMap.get(feed.url)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default DiscoverPage;

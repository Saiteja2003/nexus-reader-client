import { useState } from "react";
import { Compass, Plus, Check } from "lucide-react";
import { addFeed } from "../api";
import { DISCOVER_CATEGORIES } from "../data/discoverFeeds";
import styles from "./DiscoverPage.module.css";

function DiscoverPage({ onFeedAdded, userFeeds = [] }) {
  const [loadingUrl, setLoadingUrl] = useState(null);

  const handleSubscribe = async (feed) => {
    setLoadingUrl(feed.url);
    try {
      await addFeed(feed.url, feed.title, feed.favicon);
      if (onFeedAdded) {
        onFeedAdded(); // Triggers a refresh in MainLayout
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert("Could not add feed. It might already exist or be invalid.");
    } finally {
      setLoadingUrl(null);
    }
  };

  // Helper to check if user already has this feed
  const isSubscribed = (url) => {
    return userFeeds.some((userFeed) => userFeed.url === url);
  };

  return (
    <div className={styles.discoverPage}>
      <header className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <Compass size={32} className={styles.headerIcon} />
          <h1 className={styles.pageTitle}>Discover Intelligence</h1>
        </div>
        <p className={styles.pageSubtitle}>
          Expand your knowledge workspace with reliable insights across
          technology, global news, markets, and culture.
        </p>
      </header>

      {DISCOVER_CATEGORIES.map((section, index) => (
        <section key={index} className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <h2 className={styles.categoryTitle}>{section.category}</h2>
            <div className={styles.titleLine}></div>
          </div>

          <div className={styles.feedsGrid}>
            {section.feeds.map((feed, idx) => {
              const subscribed = isSubscribed(feed.url);
              const isLoading = loadingUrl === feed.url;

              return (
                <div key={idx} className={styles.feedCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.faviconWrapper}>
                      <img
                        src={feed.favicon}
                        alt=""
                        className={styles.favicon}
                      />
                    </div>
                    <div className={styles.feedInfo}>
                      <h3 className={styles.feedTitle}>{feed.title}</h3>
                      {feed.latestHeadline && (
                        <p className={styles.trendingHeadline}>
                          <span
                            style={{
                              color: "var(--color-accent)",
                              fontWeight: "700",
                              marginRight: "4px",
                            }}
                          >
                            Trending:
                          </span>
                          {feed.latestHeadline.substring(0, 50)}...
                        </p>
                      )}
                      <span className={styles.feedLink}>
                        {new URL(feed.url).hostname.replace("www.", "")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => !subscribed && handleSubscribe(feed)}
                    disabled={subscribed || isLoading}
                    className={`${styles.subscribeButton} ${
                      subscribed ? styles.subscribed : styles.unsubscribed
                    }`}
                  >
                    {isLoading ? (
                      "Adding..."
                    ) : subscribed ? (
                      <>
                        <Check size={16} className={styles.checkIcon} />
                        Subscribed
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default DiscoverPage;

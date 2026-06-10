import { useState, useEffect } from "react";
import { Compass, Plus, Check, Trash2, Search } from "lucide-react";
import { addFeed, deleteFeed, supabase } from "../api";
import styles from "./DiscoverPage.module.css";

function DiscoverPage({ onFeedAdded, userFeeds = [] }) {
  const [loadingUrl, setLoadingUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [curatedFeeds, setCuratedFeeds] = useState([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(true);

  // 1. Fetch the master list from your Supabase table on load
  useEffect(() => {
    const fetchCuratedFeeds = async () => {
      try {
        const { data, error } = await supabase
          .from("curated_feeds")
          .select("*")
          .order("category", { ascending: true });

        if (error) throw error;
        setCuratedFeeds(data || []);
      } catch (error) {
        console.error("Error fetching curated feeds:", error);
      } finally {
        setIsLoadingFeeds(false);
      }
    };

    fetchCuratedFeeds();
  }, []);

  const getSubscribedFeed = (url) => {
    return userFeeds.find((userFeed) => userFeed.url === url);
  };

  const handleToggleSubscribe = async (feed) => {
    const activeSubscription = getSubscribedFeed(feed.url);
    setLoadingUrl(feed.url);

    try {
      if (activeSubscription) {
        await deleteFeed(activeSubscription.id || activeSubscription._id);
      } else {
        const defaultFavicon = `https://www.google.com/s2/favicons?domain=${new URL(feed.url).hostname}&sz=64`;
        await addFeed(feed.url, feed.title, feed.favicon || defaultFavicon);
      }

      if (onFeedAdded) onFeedAdded();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingUrl(null);
    }
  };

  // 2. Filter feeds based on the search input
  const filteredFeeds = curatedFeeds.filter(
    (feed) =>
      feed.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feed.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 3. Dynamically group the filtered flat data by their category column
  const groupedCategories = filteredFeeds.reduce((groups, feed) => {
    const category = feed.category || "General";
    if (!groups[category]) groups[category] = [];
    groups[category].push(feed);
    return groups;
  }, {});

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

        {/* The Premium Search Bar */}
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for feeds, channels, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </header>

      {isLoadingFeeds ? (
        <div className={styles.loadingContainer}>
          <div className={styles.pageSpinner}></div>
          <p>Syncing global intelligence directory...</p>
        </div>
      ) : Object.keys(groupedCategories).length === 0 ? (
        <div className={styles.emptyState}>
          No channels found matching "{searchQuery}"
        </div>
      ) : (
        Object.entries(groupedCategories).map(
          ([categoryName, feeds], index) => (
            <section key={index} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>{categoryName}</h2>
                <div className={styles.titleLine}></div>
              </div>

              <div className={styles.feedsGrid}>
                {feeds.map((feed, idx) => {
                  const subscribedFeed = getSubscribedFeed(feed.url);
                  const isLoading = loadingUrl === feed.url;

                  const displayFavicon =
                    feed.favicon ||
                    `https://www.google.com/s2/favicons?domain=${new URL(feed.url).hostname}&sz=64`;

                  return (
                    <div key={feed.id || idx} className={styles.feedCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.faviconWrapper}>
                          <img
                            src={displayFavicon}
                            alt=""
                            className={styles.favicon}
                          />
                        </div>
                        <div className={styles.feedInfo}>
                          <h3 className={styles.feedTitle}>{feed.title}</h3>
                          <span className={styles.feedLink}>
                            {new URL(feed.url).hostname.replace("www.", "")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSubscribe(feed)}
                        disabled={isLoading}
                        className={`${styles.subscribeButton} ${
                          subscribedFeed
                            ? styles.subscribed
                            : styles.unsubscribed
                        }`}
                      >
                        {isLoading ? (
                          <div className={styles.spinner}></div>
                        ) : subscribedFeed ? (
                          <>
                            <span className={styles.stateDefault}>
                              <Check size={16} className={styles.checkIcon} />
                              Subscribed
                            </span>
                            <span className={styles.stateHover}>
                              <Trash2 size={16} /> Unsubscribe
                            </span>
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
          ),
        )
      )}
    </div>
  );
}

export default DiscoverPage;

// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import {
  Rss,
  Star,
  Compass,
  LogOut,
  Plus,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AddFeedModal from "./AddFeedModal";
import styles from "./Sidebar.module.css";

function Sidebar({
  feeds,
  selectedFeed,
  onSelectFeed,
  onFeedAdded,
  onDeleteFeed,
  currentView,
  onSetView,
}) {
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Read baseline theme token configuration, defaulting to clean dark mode canvas
  const [theme, setTheme] = useState(
    localStorage.getItem("nexus-theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img
              src="/nr-icon-geometric.svg"
              alt=""
              className={styles.logoIcon}
            />
            <span>Nexus Reader</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.section}>
            <button
              className={`${styles.navItem} ${currentView === "reader" && selectedFeed?.id === "all" ? styles.active : ""}`}
              onClick={() => onSelectFeed({ id: "all", title: "All Feeds" })}
            >
              <Rss size={18} />
              <span>All Feeds</span>
            </button>
            <button
              className={`${styles.navItem} ${currentView === "reader" && selectedFeed?.id === "readLater" ? styles.active : ""}`}
              onClick={() =>
                onSelectFeed({ id: "readLater", title: "Read Later" })
              }
            >
              <Star size={18} />
              <span>Read Later</span>
            </button>
            <button
              className={`${styles.navItem} ${currentView === "discover" ? styles.active : ""}`}
              onClick={() => onSetView("discover")}
            >
              <Compass size={18} />
              <span>Discover</span>
            </button>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Your Feeds</h3>
              <button
                className={styles.iconButton}
                onClick={() => setIsModalOpen(true)}
                title="Add Feed"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className={styles.feedList}>
              {feeds.map((feed) => {
                const feedId = feed.id || feed._id;
                const isSelected =
                  currentView === "reader" && selectedFeed?.id === feedId;

                return (
                  <div
                    key={feedId}
                    className={`${styles.feedItemWrapper} ${isSelected ? styles.activeFeed : ""}`}
                  >
                    <button
                      className={styles.feedItem}
                      onClick={() => onSelectFeed({ ...feed, id: feedId })}
                    >
                      {feed.favicon ? (
                        <img
                          src={feed.favicon}
                          alt=""
                          className={styles.feedFavicon}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling)
                              e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className={styles.feedFaviconFallback}
                        style={{ display: feed.favicon ? "none" : "flex" }}
                      >
                        {feed.title?.charAt(0) || "F"}
                      </span>
                      <span className={styles.feedTitle}>{feed.title}</span>
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFeed(feedId);
                      }}
                      title="Remove Feed"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      <div className={styles.footerGroup}>
        {/* Theme Toggle Button Control Option */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>
            {theme === "dark" ? "Light Appearance" : "Dark Appearance"}
          </span>
        </button>

        <div className={styles.footer}>
          <button className={styles.logoutButton} onClick={logout}>
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <AddFeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFeedAdded={onFeedAdded}
      />
    </aside>
  );
}

export default Sidebar;

// src/components/Sidebar.jsx
import { useState } from "react";
import {
  Folder,
  Rss,
  Star,
  PlusCircle,
  Trash2,
  LogOut,
  Compass,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const handleDelete = (e, feedId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this feed?")) {
      onDeleteFeed(feedId);
    }
  };

  return (
    <>
      <div className={styles.sidebar}>
        {/* ✅ This wrapper now has a specific class */}
        <div className={styles.mainContent}>
          <header className={styles.header}>NexusReader</header>

          <nav className={styles.navSection}>
            <div
              className={`${styles.navItem} ${
                currentView === "discover" ? styles.active : ""
              }`}
              onClick={() => onSetView("discover")}
            >
              <Compass />
              <span>Discover</span>
            </div>
            <div
              className={`${styles.navItem} ${
                currentView === "reader" && selectedFeed?.id === "all"
                  ? styles.active
                  : ""
              }`}
              onClick={() => onSelectFeed({ id: "all", title: "All Feeds" })}
            >
              <Rss />
              <span>All Feeds</span>
            </div>
            <div
              className={`${styles.navItem} ${
                selectedFeed?.id === "readLater" ? styles.active : ""
              }`}
              onClick={() =>
                onSelectFeed({ id: "readLater", title: "Read Later" })
              }
            >
              <Star />
              <span>Read Later</span>
            </div>
          </nav>

          <div className={styles.navSection}>
            <div className={styles.navHeader}>
              <h3 className={styles.navTitle}>Your Feeds</h3>
              <button
                className={styles.addButton}
                onClick={() => setIsModalOpen(true)}
                title="Add new feed"
              >
                <PlusCircle size={20} />
              </button>
            </div>

            {feeds.map((feed) => (
              <div
                key={feed._id}
                onClick={() => onSelectFeed(feed)}
                className={`${styles.navItem} ${
                  currentView === "reader" && selectedFeed?._id === feed._id
                    ? styles.active
                    : ""
                }`}
              >
                {feed.favicon ? (
                  <img
                    src={feed.favicon}
                    alt={`${feed.title} favicon`}
                    className={styles.favicon}
                  />
                ) : (
                  <Folder />
                )}
                <span className={styles.feedTitle}>{feed.title}</span>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => handleDelete(e, feed._id)}
                  title="Delete feed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ The logout section now has a specific "footer" class */}
        <div className={styles.footer}>
          <div className={styles.navItem} onClick={logout}>
            <LogOut />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <AddFeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFeedAdded={onFeedAdded}
      />
    </>
  );
}

export default Sidebar;

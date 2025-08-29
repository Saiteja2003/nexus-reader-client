import { useState } from 'react';
import { Folder, Rss, Star, PlusCircle, Trash2 } from 'lucide-react';
import AddFeedModal from './AddFeedModal';
import styles from './Sidebar.module.css';

function Sidebar({ feeds, selectedFeed, onSelectFeed, onFeedAdded, onDeleteFeed }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (e, feedId) => {
    e.stopPropagation(); // Prevent the feed from being selected when clicking delete
    if (window.confirm("Are you sure you want to delete this feed?")) {
      onDeleteFeed(feedId);
    }
  };

  return (
    <>
      <div className={styles.sidebar}>
        <header className={styles.header}>NexusReader</header>

        <nav className={styles.navSection}>
          <div className={styles.navItem}>
            <Rss />
            <span>All Feeds</span>
          </div>
          <div className={styles.navItem}>
            <Star />
            <span>Read Later</span>
          </div>
        </nav>

        <div className={styles.navSection}>
          <div className={styles.navHeader}>
            <h3 className={styles.navTitle}>Your Feeds</h3>
            <button className={styles.addButton} onClick={() => setIsModalOpen(true)} title="Add new feed">
              <PlusCircle size={20} />
            </button>
          </div>
          
          {feeds.map(feed => (
            <div 
              key={feed._id} 
              onClick={() => onSelectFeed(feed)}
              className={`${styles.navItem} ${selectedFeed?._id === feed._id ? styles.active : ''}`}
            >
              {feed.favicon ? (
                <img src={feed.favicon} alt={`${feed.title} favicon`} className={styles.favicon} />
              ) : (
                <Folder />
              )}
              <span className={styles.feedTitle}>{feed.title}</span>
              <button className={styles.deleteButton} onClick={(e) => handleDelete(e, feed._id)} title="Delete feed">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
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
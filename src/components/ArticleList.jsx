import Skeleton from "react-loading-skeleton";
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

// This component is now a "dumb" component. It just receives props and displays them.
function ArticleList({
  articles = [], // Default value prevents crashes
  isLoading,
  loadingTitle,
  selectedFeed,
  selectedArticle,
  onSelectArticle,
}) {
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
          Array.from({ length: 10 }).map((_, index) => (
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

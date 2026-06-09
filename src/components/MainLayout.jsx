import { useState, useEffect } from "react";
import {
  fetchFeeds as getFeeds,
  fetchSavedArticles as getSavedArticles,
  fetchArticlesFromUrl,
  deleteFeed as removeFeed,
} from "../api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import ArticleList from "./ArticleList";
import ArticleView from "./ArticleView";
import DiscoverPage from "../pages/DiscoverPage";

function MainLayout() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState({
    id: "all",
    title: "All Feeds",
  });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentView, setCurrentView] = useState("reader");
  const [savedArticles, setSavedArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState("Loading Articles...");

  useEffect(() => {
    if (user) {
      fetchFeedsList();
      fetchSavedArticlesList();
    }
  }, [user]);

  useEffect(() => {
    const CACHE_DURATION_MS = 5 * 60 * 1000;

    const loadArticles = async () => {
      if (!selectedFeed) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setArticles([]);

      if (selectedFeed.id === "readLater") {
        setArticles(savedArticles || []);
        setIsLoading(false);
        return;
      }

      const feedId = selectedFeed.id || selectedFeed._id;
      const cacheKey = `feed_cache_${feedId}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          setArticles(cachedArticles);
          setIsLoading(false);
          return;
        }
      }

      try {
        let rawArticles;
        if (selectedFeed.id === "all") {
          setLoadingTitle("Fetching all feeds...");
          const feedsToFetch = await getFeeds();
          let combinedArticles = [];
          for (const feed of feedsToFetch) {
            try {
              const data = await fetchArticlesFromUrl(feed.url);
              combinedArticles.push(
                ...(data.items || []).map((i) => ({
                  ...i,
                  feedTitle: feed.title,
                })),
              );
            } catch (e) {
              console.error(e);
            }
          }
          rawArticles = combinedArticles;
        } else {
          setLoadingTitle(`Fetching ${selectedFeed.title}...`);
          const data = await fetchArticlesFromUrl(selectedFeed.url);
          rawArticles = data.items || [];
        }

        const unique = Array.from(
          new Map(rawArticles.map((a) => [a.link || a.guid, a])).values(),
        ).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        setArticles(unique);
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ articles: unique, timestamp: Date.now() }),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setLoadingTitle("Loading...");
      }
    };

    if (currentView === "reader") loadArticles();
  }, [selectedFeed, savedArticles, currentView]);

  const fetchFeedsList = async () => {
    const data = await getFeeds();
    setFeeds(data || []);
  };

  const fetchSavedArticlesList = async () => {
    const data = await getSavedArticles();
    setSavedArticles(data || []);
  };

  const handleSelectFeed = (feed) => {
    setCurrentView("reader");
    setSelectedFeed(feed);
    setSelectedArticle(null);
  };

  const onDeleteFeed = async (id) => {
    sessionStorage.clear();
    if (selectedFeed?.id === id)
      setSelectedFeed({ id: "all", title: "All Feeds" });
    await removeFeed(id);
    fetchFeedsList();
  };

  return (
    <div className="app-container">
      <Sidebar
        feeds={feeds}
        selectedFeed={selectedFeed}
        onSelectFeed={handleSelectFeed}
        onFeedAdded={() => {
          sessionStorage.clear();
          fetchFeedsList();
        }}
        onDeleteFeed={onDeleteFeed}
        currentView={currentView}
        onSetView={setCurrentView}
      />

      {currentView === "discover" ? (
        <div
          style={{
            flex: 1,
            height: "100vh",
            overflowY: "auto",
            backgroundColor: "var(--bg-app)",
          }}
        >
          <DiscoverPage
            onFeedAdded={() => fetchFeedsList()}
            userFeeds={feeds}
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <ArticleList
            articles={articles}
            isLoading={isLoading}
            loadingTitle={loadingTitle}
            selectedFeed={selectedFeed}
            selectedArticle={selectedArticle}
            onSelectArticle={setSelectedArticle}
          />
          <ArticleView
            selectedArticle={selectedArticle}
            savedArticles={savedArticles}
            onRefreshSaved={fetchSavedArticlesList}
          />
        </div>
      )}
    </div>
  );
}
export default MainLayout;

import { useState, useEffect } from "react";
import apiClient from "../api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import ArticleList from "./ArticleList";
import ArticleView from "./ArticleView";
import DiscoverPage from "../pages/DiscoverPage";

function MainLayout() {
  // --- STATE MANAGEMENT ---
  const { user, setIsAppReady } = useAuth();
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

  // --- DATA FETCHING & CACHING LOGIC ---

  // Effect for the LURE PAGE: Pre-caches essential data on initial login.
  useEffect(() => {
    const preCacheAndPrepareApp = async () => {
      if (user) {
        const MINIMUM_DISPLAY_TIME = 500; // 2.5 seconds
        const startTime = Date.now();

        try {
          console.log("Pre-cache: Fetching user feeds and saved articles...");
          await Promise.all([
            apiClient.get("/api/feeds").then((res) => setFeeds(res.data)),
            apiClient
              .get("/api/articles/saved")
              .then((res) => setSavedArticles(res.data)),
          ]);
          console.log("Pre-cache: Essential data fetched.");

          const cacheKey = "feed_cache_all";
          const cachedData = sessionStorage.getItem(cacheKey);
          const CACHE_DURATION_MS = 5 * 60 * 1000;

          if (
            !cachedData ||
            Date.now() - JSON.parse(cachedData).timestamp > CACHE_DURATION_MS
          ) {
            console.log("Pre-cache: Warming up the 'All Feeds' cache...");
            const feedsResponse = await apiClient.get(
              "/api/feeds/articles/all"
            );
            const feedsToFetch = feedsResponse.data;
            if (feedsToFetch.length > 0) {
              let combinedArticles = [];
              for (const feed of feedsToFetch) {
                try {
                  const articlesResponse = await apiClient.get(
                    "/api/fetch-articles",
                    { params: { url: feed.url } }
                  );
                  const newItems = (articlesResponse.data.items || []).map(
                    (item) => ({ ...item, feedTitle: feed.title })
                  );
                  combinedArticles.push(...newItems);
                } catch (fetchError) {
                  console.error(
                    `Pre-caching failed for ${feed.title}:`,
                    fetchError
                  );
                }
              }
              const seen = new Set();
              const uniqueArticles = combinedArticles
                .filter((a) => {
                  const id = a.link || a.guid;
                  if (!id || seen.has(id)) return false;
                  seen.add(id);
                  return true;
                })
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
              sessionStorage.setItem(
                cacheKey,
                JSON.stringify({
                  articles: uniqueArticles,
                  timestamp: Date.now(),
                })
              );
              console.log("Pre-cache: 'All Feeds' cache has been warmed up.");
            }
          } else {
            console.log("Pre-cache: 'All Feeds' cache is already fresh.");
          }
        } catch (error) {
          console.error("--- MAINLAYOUT PRE-CACHE FAILED ---", error);
        } finally {
          const elapsedTime = Date.now() - startTime;
          const remainingTime = MINIMUM_DISPLAY_TIME - elapsedTime;
          setTimeout(
            () => {
              console.log("Pre-cache: Setting app to ready.");
              setIsAppReady(true);
            },
            remainingTime > 0 ? remainingTime : 0
          );
        }
      }
    };
    preCacheAndPrepareApp();
  }, [user, setIsAppReady]);

  // Effect for INTERACTIVE loading: Fetches articles when the user clicks a feed.
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
      const cacheKey = `feed_cache_${selectedFeed.id || selectedFeed._id}`;
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
          setLoadingTitle("Fetching subscribed feeds...");
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
              const articlesResponse = await apiClient.get(
                "/api/fetch-articles",
                { params: { url: feed.url } }
              );
              const newItems = (articlesResponse.data.items || []).map(
                (item) => ({ ...item, feedTitle: feed.title })
              );
              combinedArticles.push(...newItems);
            } catch (fetchError) {
              console.error(
                `Failed to fetch articles for ${feed.title}:`,
                fetchError
              );
            }
          }
          rawArticles = combinedArticles;
        } else {
          setLoadingTitle(`Fetching from ${selectedFeed.title}...`);
          const response = await apiClient.get("/api/fetch-articles", {
            params: { url: selectedFeed.url },
          });
          rawArticles = response.data.items || [];
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
        const cachePayload = {
          articles: uniqueArticles,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setIsLoading(false);
        setLoadingTitle("Loading Articles...");
      }
    };
    if (currentView === "reader") {
      loadArticles();
    }
  }, [selectedFeed, savedArticles, currentView]);

  // --- EVENT HANDLERS ---
  const handleSelectFeed = (feed) => {
    setCurrentView("reader");
    setSelectedFeed(feed);
    setSelectedArticle(null);
  };
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
  };
  const onFeedAdded = () => {
    sessionStorage.clear();
    fetchFeeds();
  };
  const onDeleteFeed = async (id) => {
    sessionStorage.clear();
    await apiClient.delete(`/api/feeds/${id}`);
    fetchFeeds();
  };
  const fetchFeeds = async () => {
    try {
      const response = await apiClient.get("/api/feeds");
      setFeeds(response.data);
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
      setFeeds([]);
    }
  };
  const fetchSavedArticles = async () => {
    try {
      const response = await apiClient.get("/api/articles/saved");
      setSavedArticles(response.data);
    } catch (error) {
      console.error("Failed to fetch saved articles:", error);
    }
  };

  // --- RENDER ---
  return (
    <div className="app-container">
      <Sidebar
        feeds={feeds}
        selectedFeed={selectedFeed}
        onSelectFeed={handleSelectFeed}
        onFeedAdded={onFeedAdded}
        onDeleteFeed={onDeleteFeed}
        currentView={currentView}
        onSetView={setCurrentView}
      />
      {currentView === "discover" ? (
        <DiscoverPage onFeedAdded={onFeedAdded} userFeeds={feeds} />
      ) : (
        <>
          <ArticleList
            articles={articles}
            isLoading={isLoading}
            loadingTitle={loadingTitle}
            selectedFeed={selectedFeed}
            selectedArticle={selectedArticle}
            onSelectArticle={handleSelectArticle}
          />
          <ArticleView
            selectedArticle={selectedArticle}
            savedArticles={savedArticles}
            onRefreshSaved={fetchSavedArticles}
          />
        </>
      )}
    </div>
  );
}
export default MainLayout;

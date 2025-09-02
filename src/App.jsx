import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import apiClient from "./api";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LoadingPage from "./pages/LoadingPage";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, setIsAppReady } = useAuth();

  // ✅ THE FIX: The pre-caching logic now lives in the top-level App component.
  // It runs as soon as a user is authenticated, regardless of the current page.
  useEffect(() => {
    const preCacheAndPrepareApp = async () => {
      // This logic will only run for a logged-in user who hasn't been marked as "ready" yet.
      if (user) {
        const MINIMUM_DISPLAY_TIME = 2500;
        const startTime = Date.now();

        try {
          console.log("App.jsx Pre-cache: Starting...");

          // Pre-warm the "All Feeds" cache
          const cacheKey = "feed_cache_all";
          const feedsResponse = await apiClient.get("/api/feeds/articles/all");
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
            console.log(
              "App.jsx Pre-cache: 'All Feeds' cache has been warmed up."
            );
          }
        } catch (error) {
          console.error("--- APP PRE-CACHE FAILED ---", error);
        } finally {
          const elapsedTime = Date.now() - startTime;
          const remainingTime = MINIMUM_DISPLAY_TIME - elapsedTime;
          setTimeout(
            () => {
              console.log("App.jsx Pre-cache: Setting app to ready.");
              setIsAppReady(true);
            },
            remainingTime > 0 ? remainingTime : 0
          );
        }
      }
    };

    preCacheAndPrepareApp();
  }, [user, setIsAppReady]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/prepare" element={<LoadingPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

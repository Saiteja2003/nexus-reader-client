// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { fetchFeeds, fetchArticlesFromUrl } from "./api";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LoadingPage from "./pages/LoadingPage";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, isAppReady, setIsAppReady } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const preCacheAndPrepareApp = async () => {
      if (user && !isAppReady) {
        const MINIMUM_DISPLAY_TIME = 2500;
        const startTime = Date.now();

        try {
          console.log("App.jsx Pre-cache: Starting...");
          const cacheKey = "feed_cache_all";
          const feedsToFetch = await fetchFeeds();

          if (feedsToFetch && feedsToFetch.length > 0) {
            let combinedArticles = [];
            for (const feed of feedsToFetch) {
              try {
                const articlesData = await fetchArticlesFromUrl(feed.url);
                const newItems = (articlesData.items || []).map((item) => ({
                  ...item,
                  feedTitle: feed.title,
                }));
                combinedArticles.push(...newItems);
              } catch (fetchError) {
                console.error(
                  `Pre-caching failed for ${feed.title}:`,
                  fetchError,
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
              }),
            );
            console.log(
              "App.jsx Pre-cache: 'All Feeds' cache has been warmed up.",
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
            remainingTime > 0 ? remainingTime : 0,
          );
        }
      }
    };

    preCacheAndPrepareApp();
  }, [user, isAppReady, setIsAppReady]);

  // THE FIX: Centralized fallback navigation router logic
  if (
    !user &&
    location.pathname !== "/login" &&
    location.pathname !== "/register"
  ) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/app" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/app" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/app" replace />}
      />
      <Route
        path="/prepare"
        element={
          user && !isAppReady ? <LoadingPage /> : <Navigate to="/app" replace />
        }
      />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            {isAppReady ? <MainLayout /> : <Navigate to="/prepare" replace />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

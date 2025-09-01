// src/components/MainLayout.jsx
import { useState, useEffect } from "react";
import apiClient from "../api";
import { useAuth } from "../context/AuthContext"; // 1. Import useAuth
import Sidebar from "./Sidebar";
import ArticleList from "./ArticleList";
import ArticleView from "./ArticleView";

function MainLayout() {
  const { user } = useAuth(); // 2. Get the current user from our AuthContext
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState({
    id: "all",
    title: "All Feeds",
  });
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchFeeds = async () => {
    try {
      const response = await apiClient.get("/api/feeds");
      setFeeds(response.data);
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
      // If fetching fails (e.g., bad token), clear the feeds
      setFeeds([]);
    }
  };

  // 3. This useEffect will now ONLY run when the `user` object changes
  useEffect(() => {
    // Only fetch feeds if a user is confirmed to be logged in
    if (user) {
      fetchFeeds();
    }
  }, [user]);

  const handleDeleteFeed = async (id) => {
    try {
      await apiClient.delete(`/api/feeds/${id}`);
      fetchFeeds();
    } catch (error) {
      console.error("Failed to delete feed:", error);
    }
  };

  const handleSelectFeed = (feed) => {
    setSelectedFeed(feed);
    setSelectedArticle(null);
  };

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
  };

  return (
    <div className="app-container">
      <Sidebar
        feeds={feeds}
        selectedFeed={selectedFeed}
        onSelectFeed={handleSelectFeed}
        onFeedAdded={fetchFeeds}
        onDeleteFeed={handleDeleteFeed}
      />
      <ArticleList
        selectedFeed={selectedFeed}
        selectedArticle={selectedArticle}
        onSelectArticle={handleSelectArticle}
      />
      <ArticleView selectedArticle={selectedArticle} />
    </div>
  );
}
export default MainLayout;

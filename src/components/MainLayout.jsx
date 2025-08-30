// src/components/MainLayout.jsx
import { useState, useEffect } from "react";
import apiClient from "../api";
import Sidebar from "./Sidebar";
import ArticleList from "./ArticleList";
import ArticleView from "./ArticleView";

function MainLayout() {
  // All the state and logic that was in App.jsx now lives here
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchFeeds = async () => {
    try {
      const response = await apiClient.get("/api/feeds");
      setFeeds(response.data);
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

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

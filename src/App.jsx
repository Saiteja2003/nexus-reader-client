// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';

function App() {
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null); // 1. Add new state for the article

  const fetchFeeds = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/feeds');
      setFeeds(response.data);
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleSelectFeed = (feed) => {
    setSelectedFeed(feed);
    setSelectedArticle(null); // Clear the article view when a new feed is chosen
  };

  // 2. Add a handler to set the selected article
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
  };

  const handleDeleteFeed = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/feeds/${id}`);
      // After deleting, refresh the feeds list to update the UI
      fetchFeeds();
    } catch (error) {
      console.error("Failed to delete feed:", error);
    }
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
        selectedArticle={selectedArticle}  // 3. Pass state and handler down
        onSelectArticle={handleSelectArticle} 
      />
      <ArticleView selectedArticle={selectedArticle} />
    </div>
  );
}

export default App;
// src/components/AddFeedModal.jsx
import { useState } from 'react';
import axios from 'axios';
import styles from './AddFeedModal.module.css';
import apiClient from '../api'; // Import the configured axios instance

function AddFeedModal({ isOpen, onClose, onFeedAdded }) {
  const [url, setUrl] = useState('');

  if (!isOpen) {
    return null; // Don't render anything if the modal is closed
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      // Make the POST request to our backend
      await apiClient.post('/api/feeds', { url });
      onFeedAdded(); // Tell the parent component to refresh the feed list
      onClose();     // Close the modal
    } catch (error) {
      console.error("Failed to add feed:", error);
      alert("Failed to add feed. Check the URL and try again.");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Add New Feed</h2>
        <form onSubmit={handleSubmit}>
          <p>Enter the URL of the RSS feed you want to add.</p>
          <input
            type="url"
            className={styles.input}
            placeholder="https://example.com/rss.xml"
            value={url}
            onChange={e => setUrl(e.target.value)}
            autoFocus
          />
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.button} ${styles.submitButton}`}>
              Add Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFeedModal;
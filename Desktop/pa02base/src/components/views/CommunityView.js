import React, { useState } from 'react';
import PostCard from '../post/PostCard';
import { formatTimeAgo } from '../utils/TimeAgo';

export default function CommunityView({ community, posts = [], onNavigate }) {
  const [sortOrder, setSortOrder] = useState('Newest');
  
  if (!community) return null;

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePostClick = (postId) => {
    onNavigate('post', postId);
  };

  return (
    <div className="community-view">
      {/* Community Header Section */}
      <header className="community-header" style={{ marginBottom: '24px' }}>
        <h1 className="big_header" style={{ marginBottom: '12px' }}>
          {community.name}
        </h1>
        <p className="community-description" style={{ marginBottom: '12px' }}>
          {community.description}
        </p>
        <p style={{ color: '#666', marginBottom: '12px' }}>
          Created {formatTimeAgo(community.startDate)}
        </p>
        <div className="community-stats" style={{ display: 'flex', gap: '8px' }}>
          <span>{community.postIDs.length} Posts</span>
          <span>•</span>
          <span>{community.memberCount} Members</span>
        </div>
      </header>

      {/* Sort Buttons */}
      <div id="main_button_wrapper">
        <button 
          className={`newestbttn ${sortOrder === 'Newest' ? 'active' : ''}`}
          onClick={() => handleSort('Newest')}
        >
          Newest
        </button>
        <button 
          className={`oldestbttn ${sortOrder === 'Oldest' ? 'active' : ''}`}
          onClick={() => handleSort('Oldest')}
        >
          Oldest
        </button>
        <button 
          className={`activebttn ${sortOrder === 'Active' ? 'active' : ''}`}
          onClick={() => handleSort('Active')}
        >
          Active
        </button>
      </div>

      {/* Posts Section - using modified PostCard */}
      <PostCard 
        posts={posts}
        sortOrder={sortOrder}
        onPostClick={handlePostClick}
        hideCommonityName={true} // New prop to hide community name in community view
      />
    </div>
  );
}
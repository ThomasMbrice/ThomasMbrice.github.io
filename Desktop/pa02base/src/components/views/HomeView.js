import React, { useState } from 'react';
import PostCard from '../post/PostCard';

export default function HomeView({ posts, onNavigate }) {
  const [sortOrder, setSortOrder] = useState('Newest');

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePostClick = (postId) => {
    onNavigate('post', postId);
  };

  return (
    <div>
      <div>
        <h1 className='big_header'>All Posts</h1>
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
      </div>

      <p id="community_description" className="comm_dis"></p>
      <p className="counter_p" id="counter_p">{posts.length} Posts</p>

      <PostCard 
        posts={posts}
        sortOrder={sortOrder}
        onPostClick={handlePostClick}
      />
    </div>
  );
}
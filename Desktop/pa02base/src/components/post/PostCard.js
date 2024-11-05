import React from 'react';

export default function PostCard({ posts, sortOrder = 'Newest', onPostClick, hideCommonityName = false }) {
  // Sort posts based on sortOrder
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === 'Newest') {
      return new Date(b.postedDate) - new Date(a.postedDate);
    } else if (sortOrder === 'Oldest') {
      return new Date(a.postedDate) - new Date(b.postedDate);
    }
    // For 'Active' sort
    return b.views - a.views;
  });

  // Function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="posts-container" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {sortedPosts.map((post) => (
        <div 
          key={post.postID}
          className="post"
          onClick={() => onPostClick(post.postID)}
          style={{
            padding: '15px',
            borderBottom: '1px dotted black',
            cursor: 'pointer'
          }}
        >
          {/* CONDITIOANLLY SHOW POST BASED ON COMMUNITY */}
          <div className="post-header" style={{ marginBottom: '8px' }}>
            {!hideCommonityName && (
              <>
                <span className="community-name" style={{ fontWeight: 'bold' }}>
                  {post.communityName}
                </span>
                <span className="separator"> • </span>
              </>
            )}
            <span className="posted-by">{post.postedBy}</span>
            <span className="separator"> • </span>
            <span className="timestamp">{formatDate(post.postedDate)}</span>
          </div>
        
          <h3 className="post-title" style={{ margin: '8px 0' }}>
            {post.title}
          </h3>

          {post.linkFlairID && (
            <div className="link-flair">
              {post.linkFlair}
            </div>
          )}

          <p className="post-content" style={{ margin: '8px 0' }}>
            {post.content.slice(0, 80)}
            {post.content.length > 80 ? '...' : ''}
          </p>

          <div 
            className="post-stats"
            style={{
              display: 'flex',
              gap: '20px',
              fontSize: '0.9em',
              color: '#666'
            }}
          >
            <span>{post.views} views</span>
            <span>{post.commentIDs.length} comments</span>
          </div>
        </div>
      ))}
    </div>
  );
}
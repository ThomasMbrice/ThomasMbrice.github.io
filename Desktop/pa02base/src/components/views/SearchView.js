import React, { useState, useEffect } from 'react';
import PostCard from '../post/PostCard';

export default function SearchView({ searchQuery, model, onNavigate }) {
  const [sortOrder, setSortOrder] = useState('Newest');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchQuery) return;

    const searchTerms = searchQuery.toLowerCase()
      .split(' ')
      .filter(term => !['is', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to'].includes(term));

    const matchingPosts = model.data.posts.filter(post => {
      // check post title and content
      const titleMatch = searchTerms.some(term => 
        post.title.toLowerCase().includes(term)
      );
      const contentMatch = searchTerms.some(term => 
        post.content.toLowerCase().includes(term)
      );

      const commentsMatch = post.commentIDs.some(commentId => {
        const comment = model.data.comments.find(c => c.commentID === commentId);
        return comment && searchTerms.some(term => 
          comment.content.toLowerCase().includes(term)
        );
      });

      return titleMatch || contentMatch || commentsMatch;
    });

    const enhancedPosts = matchingPosts.map(post => {
      const community = model.data.communities.find(
        c => c.postIDs.includes(post.postID)
      );
      const linkFlair = model.data.linkFlairs.find(
        flair => flair.linkFlairID === post.linkFlairID
      );
      return {
        ...post,
        communityName: community ? community.name : 'Unknown Community',
        linkFlair: linkFlair ? linkFlair.content : null
      };
    });

    setSearchResults(enhancedPosts);
  }, [searchQuery, model]);

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePostClick = (postId) => {
    onNavigate('post', postId);
  };

  return (
    <div className="search-view">
      <h1 className="big_header">
        {searchResults.length > 0 
          ? `Results for: ${searchQuery}`
          : `No results found for: ${searchQuery}`
        }
      </h1>

      <p className="counter_p">
        {searchResults.length} {searchResults.length === 1 ? 'Post' : 'Posts'}
      </p>

      {searchResults.length > 0 ? (
        <>
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

          {/* actual results loaded */}
          <PostCard 
            posts={searchResults}
            sortOrder={sortOrder}
            onPostClick={handlePostClick}
          />
        </>
      ) : (
        // NA
        <div>
          <p> No posts found matching your search terms </p>
        </div>
      )}
    </div>
  );
}
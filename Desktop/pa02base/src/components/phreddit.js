import { useState, useEffect } from 'react';
import Banner from './layout/Banner';
import Navbar from './layout/Navbar';
import HomeView from './views/HomeView';
import CommunityView from './views/CommunityView';
import SearchView from './views/SearchView';
import PostView from './views/PostView';
import NewCommunityView from './views/NewCommunityView';
import NewPostView from './views/NewPostView';
import NewCommentView from './views/NewCommentView';
import Model from '../models/model.js';

export default function Phreddit() {
  const [currentView, setCurrentView] = useState('home'); // create states
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [model] = useState(new Model());

  // init the model and load initial data
  useEffect(() => {
    setCommunities(model.data.communities);
    // init posts with all posts and add community names
    const initialPosts = model.data.posts.map(post => {
      const community = model.data.communities.find(
        c => c.postIDs.includes(post.postID)
      );
      // find link flair content
      const linkFlair = model.data.linkFlairs.find(
        flair => flair.linkFlairID === post.linkFlairID
      );
      return {
        ...post,
        communityName: community ? community.name : 'Unknown Community',
        linkFlair: linkFlair ? linkFlair.content : null
      };
    });
    setPosts(initialPosts);
  }, [model]);

  // MAIN NAVIGATION
  const navigateTo = (view, data = null) => {
    if (data && view === 'post') {
      setCurrentView(view);
    } else {
      setCurrentView(view);
    }
  };

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    setCurrentView('community');

    // Get posts for this community with community name and link flairs
    const communityPosts = model.data.posts
      .filter(post => community.postIDs.includes(post.postID))
      .map(post => {
        const linkFlair = model.data.linkFlairs.find(
          flair => flair.linkFlairID === post.linkFlairID
        );
        return {
          ...post,
          communityName: community.name,
          linkFlair: linkFlair ? linkFlair.content : null
        };
      });
    setPosts(communityPosts);
  };

  const onSearch= (query) => { // commands sear ch
    setSearchQuery(query);
    navigateTo('search')
  };

  const handleHomeClick = () => {
    setSelectedCommunity(null);
    // Reset posts to show all posts with community names
    const allPosts = model.data.posts.map(post => {
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
    setPosts(allPosts);
    navigateTo('home');
  };

  const handleCreatePost = () => {
    navigateTo('newPost');
  };

  const handleCreateCommunity = () => {
    navigateTo('newCommunity');
  };

  // Render the appropriate view
  const renderView = () => {
    switch(currentView) { // to choose what view user is interacting with 
      case 'home':
        return (
          <HomeView onNavigate={navigateTo} posts={selectedCommunity ? posts : posts} postsCount={selectedCommunity ? posts.length : posts.length} 
          /> // create homeview as defaalt with props 
        );
      case 'community':
        return <CommunityView onNavigate={navigateTo} community={selectedCommunity} posts={posts}/>; // calling comm veiw with props 
      case 'search':
        return <SearchView onNavigate={navigateTo} searchQuery={searchQuery} model={model}/>;
      case 'post':
        return <PostView onNavigate={navigateTo} />;
      case 'newCommunity':
        return <NewCommunityView onNavigate={navigateTo} />;
      case 'newPost':
        return <NewPostView onNavigate={navigateTo} />;
      case 'newComment':
        return <NewCommentView onNavigate={navigateTo} />;
      default:
        return <HomeView onNavigate={navigateTo} posts={posts} />;
    }
  };

  return ( // phreddit must alwaus load navbar and banner then main is depended on user action but at default will always be home
    <div> 
      <Banner currentView={currentView} onCreatePost={handleCreatePost} onSearch={onSearch}/>
      <div className="phreddit-container">
        <Navbar
          communities={communities}
          onHomeClick={handleHomeClick}
          onCreateCommunity={handleCreateCommunity}
          onCommunitySelect={handleCommunitySelect}
          selectedCommunity={selectedCommunity}
          currentView={currentView}
        />
        <main className="main">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
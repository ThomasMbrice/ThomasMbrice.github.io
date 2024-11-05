export default function Navbar({ 
  communities = [], 
  onHomeClick, 
  onCreateCommunity, 
  onCommunitySelect,
  selectedCommunity,
  currentView
}) {
  
  const handleCommunityClick = (community) => {
    onCommunitySelect(community);
  };


  return (
    <div className="sidebar">
      <div className="button-container">
        <button 
        className={`home_sidebar ${currentView === 'home' ? 'active' : ''}`}
          onClick={onHomeClick}
        >
          Home
        </button>
      </div>
      <h1>Communities</h1>
      <button 
        className={`home_sidebar ${currentView === 'newCommunity' ? 'active' : ''}`}
        onClick={onCreateCommunity}
      >
        Create Community
      </button>
      <div className="comm_list">
        {communities.map((community) => (
          <button
            key={community.communityID}
            onClick={() => handleCommunityClick(community)}
            className={`community-button ${selectedCommunity?.communityID === community.communityID ? 'active' : ''}`}
          >
            {community.name}
          </button>
        ))}
      </div>
    </div>
  );
}
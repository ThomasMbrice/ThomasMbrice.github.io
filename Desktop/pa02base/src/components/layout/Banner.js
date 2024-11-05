import '../../stylesheets/global.css';

export default function Banner({ onSearch, onCreatePost,currentView }) {
  return (
    <div className="header">
      <a href="#home" className="logo">Phreddit</a>
      <input 
        className="search_main" 
        placeholder="Search Phreddit…"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button 
        className={`create_post ${currentView === 'newPost' ? 'active' : ''}`}
        onClick={onCreatePost}
      >
        Create Post +
      </button>
    </div>
  );
}
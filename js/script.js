let menuIcon = document.querySelector("#menu-icon");
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navlinks = document.querySelectorAll('header nav a');

class GitHubProjects {
    constructor() {
        this.username = 'ThomasMbrice';
        this.allProjects = [];
        this.init();
    }
    
    async init() {
        await this.fetchProjects();
        this.displayProjectsByCategory();
        this.setupFiltering();
    }
    
    async fetchProjects() {
        try {
            const response = await fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=20`);
            const repos = await response.json();
            
            this.allProjects = repos.filter(repo => !repo.fork);
            //console.log('Loaded projects:', this.allProjects.length);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError();
        }
    }
    
    categorizeProjects() {
        const categories = {
            ml: [],
            cloud: [],
            backend: [],
            other: []
        };
            this.allProjects.forEach(project => {
        const description = project.description || '';
        
        // Check last 2 characters of description
        const lastTwo = description.slice(-2).toLowerCase();
        
        if (lastTwo === 'ml') {
            categories.ml.push(project);
        } else if (lastTwo === 'cl') {
            categories.cloud.push(project);
        } else if (lastTwo === 'bk') {
            categories.backend.push(project);
        } else {
            categories.other.push(project);
        }
    });
    
    return categories;
}

    displayProjectsByCategory() {
    const container = document.getElementById('github-projects');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'none';
    
    const categories = this.categorizeProjects();
    
    let html = '';
    
    // Use the same category IDs as the tags
    if (categories.ml.length > 0) {
        html += this.createCategorySection('Machine Learning', categories.ml, 'ml');
    }
    
    if (categories.cloud.length > 0) {
        html += this.createCategorySection('Cloud Engineering', categories.cloud, 'cl');
    }
    
    if (categories.backend.length > 0) {
        html += this.createCategorySection('Backend Development', categories.backend, 'bk');
    }
    
    if (categories.other.length > 0) {
        html += this.createCategorySection('Other Projects', categories.other, 'other');
    }
    
    container.innerHTML = html;
}

    createCategorySection(title, projects, categoryId) {
        return `
            <div class="category-section" data-category="${categoryId}">
                <div class="category-header">
                    <h3>${title} (${projects.length})</h3>
                </div>
                <div class="category-projects">
                    ${projects.map(project => this.createProjectCard(project)).join('')}
                </div>
            </div>
        `;
    }

    createProjectCard(project) {
    // Remove last 2 letters from description if they're category tags
    let description = project.description || 'No description available - update this on GitHub!';
    const lastTwo = description.slice(-2).toLowerCase();
    
    if (['ml', 'cl', 'bk'].includes(lastTwo)) {
        description = description.slice(0, -2).trim();
    }
    
    return `
        <div class="proj-box">
            <div class="proj-info">
                <div class="proj-content">
                    <h4>${project.name.replace(/[_-]/g, ' ')}</h4>
                    <p>${description}</p>
                </div>
                <div class="proj-links">
                    <a href="${project.html_url}" target="_blank" class="btn btn-inverted">
                        <i class='bx bxl-github'></i> View Code
                    </a>
                    ${project.homepage ? `
                        <a href="${project.homepage}" target="_blank" class="btn btn-inverted">
                            <i class='bx bx-link-external'></i> Live Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

    setupFiltering() {
    // Add click listeners to Venn circles
    document.querySelectorAll('.venn-circle').forEach(circle => {
        circle.addEventListener('click', () => {
            const category = circle.dataset.category;
            this.filterByCategory(category);
            
            // Update active state
            this.updateActiveCircle(circle);
            
            // Scroll to projects section
            document.getElementById('proj').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Add reset button functionality
    document.addEventListener('click', (e) => {
        if (e.target.id === 'reset-filter') {
            this.resetFilter();
        }
    });
}

filterByCategory(category) {
    const sections = document.querySelectorAll('.category-section');
    const resetBtn = document.getElementById('reset-filter');
    
    console.log('=== BEFORE FILTERING ===');
    sections.forEach((section, index) => {
        //console.log(`Section ${index}: category="${section.dataset.category}", display="${section.style.display}"`);
    });
    
    sections.forEach((section, index) => {
        const sectionCategory = section.dataset.category;
        
        if (sectionCategory === category) {
            section.style.display = 'block';
            // Removed: section.style.backgroundColor = 'lightgreen';
            //console.log(`✓ SHOWING section: ${sectionCategory}`);
        } else {
            section.style.display = 'none';
            // Removed: section.style.backgroundColor = 'lightcoral';
            //console.log(`✗ HIDING section: ${sectionCategory}`);
        }
    });
    
    console.log('=== AFTER FILTERING ===');
    sections.forEach((section, index) => {
        console.log(`Section ${index}: category="${section.dataset.category}", display="${section.style.display}"`);
    });
    
    // Show reset button
    if (resetBtn) {
        resetBtn.style.display = 'block';
    }
    
    this.updateFilterText(category);
}

resetFilter() {
    const sections = document.querySelectorAll('.category-section');
    const resetBtn = document.getElementById('reset-filter');
    
    // Show all sections
    sections.forEach(section => {
        section.style.display = 'block';
    });
    
    // Hide reset button
    if (resetBtn) {
        resetBtn.style.display = 'none';
    }
    
    // Clear active circles
    document.querySelectorAll('.venn-circle').forEach(circle => {
        circle.classList.remove('active');
    });
    
    // Update filter text
    this.updateFilterText('all');
    
    console.log('Showing all projects');
}

updateActiveCircle(activeCircle) {
    // Remove active from all circles
    document.querySelectorAll('.venn-circle').forEach(circle => {
        circle.classList.remove('active');
    });
    
    // Add active to clicked circle
    activeCircle.classList.add('active');
}

updateFilterText(category) {
    const filterText = document.getElementById('filter-status');
    if (filterText) {
        const categoryNames = {
            all: 'All Projects',
            ml: 'Machine Learning Projects',
            cloud: 'Cloud Engineering Projects', 
            backend: 'Backend Development Projects'
        };
        filterText.textContent = `Showing: ${categoryNames[category] || 'All Projects'}`;
    }
}
    
    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function() {    
    new GitHubProjects();
});


window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height){
            navlinks.forEach(links => {
                links.classList.remove('active');
            });
            
            // Fix: Use querySelector instead of querySelectorAll, and fix the selector
            const activeLink = document.querySelector('header nav a[href*=' + id + ']');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

function checkScreenSize() {
    const breakpointWidth = 1024;
    const popup = document.getElementById('popup');

    if (window.innerWidth < breakpointWidth) {
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 10000); // Hide after 10 seconds
    }
}

// Execute the function on page load
window.addEventListener('load', checkScreenSize);

// Optional: Re-check on window resize
window.addEventListener('resize', checkScreenSize);

document.addEventListener('DOMContentLoaded', function() {
    new GitHubProjects();
    new GitHubActivity(); 
    new PathfindingGame();

    document.getElementById('downloadBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default anchor click behavior

        var link = document.createElement('a');
        link.href = 'public/resume/ThomasMbriceResume.png'; // Path to your resume
        link.download = 'ThomasMbriceResume.png'; // Name of the file to be downloaded
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    const imageContainer = document.getElementById('contactImage');
    if (imageContainer) {
        const img = new Image();
        img.src = 'public/pictures/IMG_3074.JPG';  // Adjust path as needed
        img.alt = 'Contact illustration';
        img.style.cssText = 'max-width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); height: 75%;';
        
        // Add error handling
        img.onerror = function() {
            console.error('Error loading image');
            // Optionally set a fallback image or display an error message
        };
        
        img.onload = function() {
            imageContainer.appendChild(img);
        };
    }
});

        document.addEventListener('DOMContentLoaded', function() {
            const circles = document.querySelectorAll('.venn-circle');
            const intersections = document.querySelectorAll('.intersection');

            // Animate circles on load
            circles.forEach((circle, index) => {
                circle.style.animation = `fadeInScale 0.8s ease ${index * 0.2}s both`;
            });

            // Animate intersections on load
            intersections.forEach((intersection, index) => {
                intersection.style.animation = `bounceIn 0.6s ease ${0.8 + index * 0.1}s both`;
            });

            // Add click effects
            circles.forEach(circle => {
                circle.addEventListener('click', function() {
                    this.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                });
            });
        });

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.5);
                }
                to {
                    opacity: 0.7;
                    transform: scale(1);
                }
            }

            @keyframes bounceIn {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    transform: scale(1.05);
                }
                70% {
                    transform: scale(0.9);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);

// GitHub Activity Feed Manager
class GitHubActivity {
    constructor() {
        this.username = 'ThomasMbrice';
        this.activities = [];
        this.init();
    }
    
    async init() {
        await this.fetchActivity();
        this.displayActivity();
    }
    
    async fetchActivity() {
        const loading = document.getElementById('linkedin-loading');
        if (loading) loading.style.display = 'block';
        
        try {
            //console.log('🔍 Fetching GitHub activity...');
            
            // GitHub Events API - public, no auth needed!
            const response = await fetch(`https://api.github.com/users/${this.username}/events?per_page=20`);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const events = await response.json();
            //console.log('✅ GitHub events received:', events.length);
            
            // Transform GitHub events to activities
            this.activities = this.parseGitHubEvents(events);
            //console.log('✅ Activities processed:', this.activities.length);
            
        } catch (error) {
            //console.error('❌ Failed to fetch GitHub activity:', error);
            this.activities = [];
        }
        
        if (loading) loading.style.display = 'none';
    }
    
    parseGitHubEvents(events) {
        const activities = [];
        
        events.forEach(event => {
            let activity = null;
            
            switch (event.type) {
                case 'PushEvent':
                    const commitCount = event.payload.commits?.length || 0;
                    activity = {
                        type: 'commit',
                        icon: 'bx-git-commit',
                        content: `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.repo.name}`,
                        details: event.payload.commits?.[0]?.message || 'Recent code updates',
                        date: event.created_at,
                        repo: event.repo.name
                    };
                    break;
                    
                case 'CreateEvent':
                    if (event.payload.ref_type === 'repository') {
                        activity = {
                            type: 'create',
                            icon: 'bx-plus-circle',
                            content: `Created new repository: ${event.repo.name}`,
                            details: event.payload.description || 'New project started',
                            date: event.created_at,
                            repo: event.repo.name
                        };
                    }
                    break;
                    
                case 'WatchEvent':
                    activity = {
                        type: 'star',
                        icon: 'bx-star',
                        content: `Starred ${event.repo.name}`,
                        details: 'Found something interesting!',
                        date: event.created_at,
                        repo: event.repo.name
                    };
                    break;
                    
                case 'ForkEvent':
                    activity = {
                        type: 'fork',
                        icon: 'bx-git-branch',
                        content: `Forked ${event.repo.name}`,
                        details: 'Contributing to open source',
                        date: event.created_at,
                        repo: event.repo.name
                    };
                    break;
                    
                case 'IssuesEvent':
                    activity = {
                        type: 'issue',
                        icon: 'bx-bug',
                        content: `${event.payload.action} issue in ${event.repo.name}`,
                        details: event.payload.issue?.title || 'Working on project improvements',
                        date: event.created_at,
                        repo: event.repo.name
                    };
                    break;
                    
                case 'PullRequestEvent':
                    activity = {
                        type: 'pr',
                        icon: 'bx-git-pull-request',
                        content: `${event.payload.action} pull request in ${event.repo.name}`,
                        details: event.payload.pull_request?.title || 'Code review and collaboration',
                        date: event.created_at,
                        repo: event.repo.name
                    };
                    break;
            }
            
            if (activity) {
                activities.push(activity);
            }
        });
        
        // Return latest 4-5 activities
        return activities.slice(0, 5);
    }
    
    displayActivity() {
        const container = document.getElementById('sidebar-posts');
        
        if (!container) {
            //console.error('❌ sidebar-posts container not found!');
            return;
        }
        
        if (this.activities.length === 0) {
            container.innerHTML = `
                <div class="no-activity-message">
                    <p>Recent GitHub activity will appear here.</p>
                    <p style="font-size: 1.2rem; opacity: 0.7;">Keep coding! 🚀</p>
                </div>
            `;
            return;
        }
        
        //console.log('🎨 Displaying', this.activities.length, 'activities');
        
        container.innerHTML = this.activities.map(activity => `
            <div class="sidebar-post">
                <div class="activity-header">
                    <i class='bx ${activity.icon}' style="color: var(--main-color); margin-right: 0.5rem;"></i>
                    <span class="activity-date">${this.formatDate(activity.date)}</span>
                </div>
                <div class="post-content">
                    <strong>${activity.content}</strong>
                    <p style="font-size: 1.1rem; opacity: 0.8; margin: 0.5rem 0 0 0;">${activity.details}</p>
                </div>
                <div class="activity-repo">
                    <i class='bx bx-code-alt'></i>
                    <span>${activity.repo}</span>
                </div>
            </div>
        `).join('');
        
        // Animate activities appearing
        const posts = container.querySelectorAll('.sidebar-post');
        posts.forEach((post, index) => {
            post.style.opacity = '0';
            post.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                post.style.transition = 'all 0.5s ease';
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, index * 200);
        });
        
        //console.log('✅ GitHub activity displayed successfully!');
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    }
}


// Pathfinding Visualizer Game
class PathfindingGame {
    constructor() {
        this.rows = 15;
        this.cols = 25;
        this.grid = [];
        this.startNode = { row: 7, col: 5 };
        this.endNode = { row: 7, col: 20 };
        this.isRunning = false;
        this.isDrawing = false;
        this.speed = 50; // milliseconds delay
        
        this.init();
    }
    
    init() {
        this.createGrid();
        this.setupEventListeners();
        this.updateStats(0, 0, 0);
    }
    
    createGrid() {
        const gridElement = document.getElementById('pathfinding-grid');
        gridElement.innerHTML = '';
        this.grid = [];
        
        // Adjust grid size for mobile
        if (window.innerWidth <= 768) {
            this.rows = 12;
            this.cols = 20;
            // Re-position nodes to fit within the smaller grid (col 20 would be out of bounds)
            this.startNode = { row: 6, col: 3 };
            this.endNode = { row: 6, col: 17 };
            gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
            gridElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        }
        
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = {
                    row,
                    col,
                    isStart: row === this.startNode.row && col === this.startNode.col,
                    isEnd: row === this.endNode.row && col === this.endNode.col,
                    isWall: false,
                    isVisited: false,
                    distance: Infinity,
                    previousNode: null,
                    gScore: Infinity,
                    fScore: Infinity,
                    heuristic: 0
                };
                
                const cellElement = document.createElement('div');
                cellElement.className = 'grid-cell';
                cellElement.id = `cell-${row}-${col}`;
                
                if (cell.isStart) cellElement.classList.add('start-node');
                if (cell.isEnd) cellElement.classList.add('end-node');
                
                gridElement.appendChild(cellElement);
                currentRow.push(cell);
            }
            this.grid.push(currentRow);
        }
    }
    
    setupEventListeners() {
        //  algosearch
        document.getElementById('algorithm-select').addEventListener('change', (e) => {
            this.algorithm = e.target.value;
        });
        
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.speed = 110 - (value * 10); // Invert: higher value = faster
            speedValue.textContent = value;
        });
        
        // cntr buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startPathfinding());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearGrid());
        document.getElementById('generate-maze-btn').addEventListener('click', () => this.generateMaze());
        
        const gridElement = document.getElementById('pathfinding-grid');
        
        gridElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        gridElement.addEventListener('mouseover', (e) => this.handleMouseOver(e));
        gridElement.addEventListener('mouseup', () => this.handleMouseUp());

        gridElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch support for mobile
        gridElement.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        gridElement.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        gridElement.addEventListener('touchend', () => this.handleTouchEnd());
    }
    
    handleMouseDown(e) {
        if (this.isRunning) return;
        
        const cellId = e.target.id;
        if (!cellId.startsWith('cell-')) return;
        
        const [, row, col] = cellId.split('-').map(Number);
        const cell = this.grid[row][col];
        
        if (cell.isStart || cell.isEnd) {
            this.movingNode = cell.isStart ? 'start' : 'end';
        } else {
            this.isDrawing = true;
            this.toggleWall(row, col);
        }
    }
    
    handleMouseOver(e) {
        if (this.isRunning) return;
        
        const cellId = e.target.id;
        if (!cellId.startsWith('cell-')) return;
        
        const [, row, col] = cellId.split('-').map(Number);
        
        if (this.movingNode) {
            this.moveNode(row, col);
        } else if (this.isDrawing) {
            this.toggleWall(row, col);
        }
    }
    
    handleMouseUp() {
        this.isDrawing = false;
        this.movingNode = null;
    }

    handleTouchStart(e) {
        if (this.isRunning) return;
        e.preventDefault();

        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element || !element.id.startsWith('cell-')) return;

        const [, row, col] = element.id.split('-').map(Number);
        const cell = this.grid[row][col];

        if (cell.isStart || cell.isEnd) {
            this.movingNode = cell.isStart ? 'start' : 'end';
        } else {
            this.isDrawing = true;
            // Track whether we're adding or erasing so drag stays consistent
            this.drawingWall = !cell.isWall;
            this.toggleWall(row, col);
        }
    }

    handleTouchMove(e) {
        if (this.isRunning) return;
        if (!this.isDrawing && !this.movingNode) return;
        e.preventDefault();

        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element || !element.id.startsWith('cell-')) return;

        const [, row, col] = element.id.split('-').map(Number);

        if (this.movingNode) {
            this.moveNode(row, col);
        } else if (this.isDrawing) {
            const cell = this.grid[row][col];
            if (!cell.isStart && !cell.isEnd && cell.isWall !== this.drawingWall) {
                this.toggleWall(row, col);
            }
        }
    }

    handleTouchEnd() {
        this.isDrawing = false;
        this.movingNode = null;
        this.drawingWall = null;
    }

    moveNode(row, col) {
        const cell = this.grid[row][col];
        if (cell.isWall) return;
        
        if (this.movingNode === 'start' && !cell.isEnd) {
            // clear old start
            const oldStart = document.getElementById(`cell-${this.startNode.row}-${this.startNode.col}`);
            oldStart.classList.remove('start-node');
            this.grid[this.startNode.row][this.startNode.col].isStart = false;
            
            // Set new start
            this.startNode = { row, col };
            cell.isStart = true;
            const newStart = document.getElementById(`cell-${row}-${col}`);
            newStart.classList.add('start-node');
        } else if (this.movingNode === 'end' && !cell.isStart) {
            // Clear old end
            const oldEnd = document.getElementById(`cell-${this.endNode.row}-${this.endNode.col}`);
            oldEnd.classList.remove('end-node');
            this.grid[this.endNode.row][this.endNode.col].isEnd = false;
            
            // Set new end
            this.endNode = { row, col };
            cell.isEnd = true;
            const newEnd = document.getElementById(`cell-${row}-${col}`);
            newEnd.classList.add('end-node');
        }
    }
    
    toggleWall(row, col) {
        const cell = this.grid[row][col];
        if (cell.isStart || cell.isEnd) return;
        
        cell.isWall = !cell.isWall;
        const cellElement = document.getElementById(`cell-${row}-${col}`);
        
        if (cell.isWall) {
            cellElement.classList.add('wall-node');
        } else {
            cellElement.classList.remove('wall-node');
        }
    }
    
    async startPathfinding() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clearPath();
        
        const startBtn = document.getElementById('start-btn');
        startBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Finding...';
        startBtn.disabled = true;
        
        const startTime = performance.now();
        let result;
        
        switch (this.algorithm) {
            case 'astar':
                result = await this.aStar();
                break;
            case 'dijkstra':
                result = await this.dijkstra();
                break;
            case 'bfs':
                result = await this.breadthFirstSearch();
                break;
            case 'dfs':
                result = await this.depthFirstSearch();
                break;
            default:
                result = await this.aStar();
        }
        
        const endTime = performance.now();
        const timeTaken = Math.round(endTime - startTime);
        
        if (result.path.length > 0) {
            await this.animatePath(result.path);
        }
        
        this.updateStats(timeTaken, result.visitedCount, result.path.length);
        
        startBtn.innerHTML = '<i class="bx bx-play"></i> Find Path';
        startBtn.disabled = false;
        this.isRunning = false;
    }
    
    // A* Algorithm
    async aStar() {
        const openSet = [];
        const visitedNodes = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        const endNode = this.grid[this.endNode.row][this.endNode.col];
        
        startNode.gScore = 0;
        startNode.fScore = this.heuristic(startNode, endNode);
        openSet.push(startNode);
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            openSet.sort((a, b) => a.fScore - b.fScore);
            const currentNode = openSet.shift();
            
            if (currentNode === endNode) {
                return { path: this.reconstructPath(endNode), visitedCount: visitedNodes.length };
            }
            
            currentNode.isVisited = true;
            visitedNodes.push(currentNode);
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                const cellElement = document.getElementById(`cell-${currentNode.row}-${currentNode.col}`);
                cellElement.classList.add('visited-node');
                await this.delay(this.speed);
            }
            
            const neighbors = this.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (neighbor.isWall || neighbor.isVisited) continue;
                
                const tentativeGScore = currentNode.gScore + 1;
                
                if (tentativeGScore < neighbor.gScore) {
                    neighbor.previousNode = currentNode;
                    neighbor.gScore = tentativeGScore;
                    neighbor.fScore = neighbor.gScore + this.heuristic(neighbor, endNode);
                    
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        return { path: [], visitedCount: visitedNodes.length };
    }
    
    // Dijkstra's Algorithm
    async dijkstra() {
        const unvisitedNodes = [];
        const visitedNodes = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        const endNode = this.grid[this.endNode.row][this.endNode.col];
        
        // Initialize distances
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                node.distance = node === startNode ? 0 : Infinity;
                unvisitedNodes.push(node);
            }
        }
        
        while (unvisitedNodes.length > 0) {
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const currentNode = unvisitedNodes.shift();
            
            if (currentNode.distance === Infinity) break;
            if (currentNode === endNode) {
                return { path: this.reconstructPath(endNode), visitedCount: visitedNodes.length };
            }
            
            currentNode.isVisited = true;
            visitedNodes.push(currentNode);
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                const cellElement = document.getElementById(`cell-${currentNode.row}-${currentNode.col}`);
                cellElement.classList.add('visited-node');
                await this.delay(this.speed);
            }
            
            const neighbors = this.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (neighbor.isWall || neighbor.isVisited) continue;
                
                const distance = currentNode.distance + 1;
                if (distance < neighbor.distance) {
                    neighbor.distance = distance;
                    neighbor.previousNode = currentNode;
                }
            }
        }
        
        return { path: [], visitedCount: visitedNodes.length };
    }
    
    // Breadth-First Search
    async breadthFirstSearch() {
        const queue = [];
        const visitedNodes = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        const endNode = this.grid[this.endNode.row][this.endNode.col];
        
        queue.push(startNode);
        startNode.isVisited = true;
        
        while (queue.length > 0) {
            const currentNode = queue.shift();
            visitedNodes.push(currentNode);
            
            if (currentNode === endNode) {
                return { path: this.reconstructPath(endNode), visitedCount: visitedNodes.length };
            }
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                const cellElement = document.getElementById(`cell-${currentNode.row}-${currentNode.col}`);
                cellElement.classList.add('visited-node');
                await this.delay(this.speed);
            }
            
            const neighbors = this.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (neighbor.isWall || neighbor.isVisited) continue;
                
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }
        
        return { path: [], visitedCount: visitedNodes.length };
    }
    
    // Depth-First Search
    async depthFirstSearch() {
        const stack = [];
        const visitedNodes = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        const endNode = this.grid[this.endNode.row][this.endNode.col];
        
        stack.push(startNode);
        
        while (stack.length > 0) {
            const currentNode = stack.pop();
            
            if (currentNode.isVisited) continue;
            
            currentNode.isVisited = true;
            visitedNodes.push(currentNode);
            
            if (currentNode === endNode) {
                return { path: this.reconstructPath(endNode), visitedCount: visitedNodes.length };
            }
            
            if (!currentNode.isStart && !currentNode.isEnd) {
                const cellElement = document.getElementById(`cell-${currentNode.row}-${currentNode.col}`);
                cellElement.classList.add('visited-node');
                await this.delay(this.speed);
            }
            
            const neighbors = this.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (neighbor.isWall || neighbor.isVisited) continue;
                
                neighbor.previousNode = currentNode;
                stack.push(neighbor);
            }
        }
        
        return { path: [], visitedCount: visitedNodes.length };
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        
        // Up, Right, Down, Left
        const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                neighbors.push(this.grid[newRow][newCol]);
            }
        }
        
        return neighbors;
    }
    
    heuristic(nodeA, nodeB) {
        // Manhattan distance
        return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
    }
    
    reconstructPath(endNode) {
        const path = [];
        let currentNode = endNode;
        
        while (currentNode) {
            path.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        
        return path;
    }
    
    async animatePath(path) {
        for (let i = 1; i < path.length - 1; i++) {
            const node = path[i];
            const cellElement = document.getElementById(`cell-${node.row}-${node.col}`);
            cellElement.classList.add('path-node');
            await this.delay(50);
        }
    }
    
    clearGrid() {
        if (this.isRunning) return;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                const cellElement = document.getElementById(`cell-${row}-${col}`);
                
                if (!node.isStart && !node.isEnd) {
                    node.isWall = false;
                    cellElement.className = 'grid-cell';
                }
                
                this.resetNodeForPathfinding(node);
            }
        }
        
        this.updateStats(0, 0, 0);
    }
    
    clearPath() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                const cellElement = document.getElementById(`cell-${row}-${col}`);
                
                cellElement.classList.remove('visited-node', 'current-node', 'path-node');
                this.resetNodeForPathfinding(node);
            }
        }
    }
    
    resetNodeForPathfinding(node) {
        node.isVisited = false;
        node.distance = Infinity;
        node.previousNode = null;
        node.gScore = Infinity;
        node.fScore = Infinity;
        node.heuristic = 0;
    }
    
    generateMaze() {
        if (this.isRunning) return;
        
        this.clearGrid();
        
        // Generate random walls
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                
                if (!node.isStart && !node.isEnd && Math.random() < 0.3) {
                    node.isWall = true;
                    const cellElement = document.getElementById(`cell-${row}-${col}`);
                    cellElement.classList.add('wall-node');
                }
            }
        }
    }
    
    updateStats(time, visited, pathLength) {
        document.getElementById('time-stat').textContent = `${time}ms`;
        document.getElementById('visited-stat').textContent = `${visited} visited`;
        document.getElementById('path-stat').textContent = `${pathLength} path length`;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
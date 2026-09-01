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
    new QuantumSandbox();
    new MLSimulator();

    // Playground tab switching
    const playgroundTabs = document.querySelectorAll('.playground-tab');
    playgroundTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');

            playgroundTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.playground-panel').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const panel = document.getElementById(targetId);
            if (panel) panel.classList.add('active');
        });
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


// ============================================================
// Quantum Sandbox — 3-qubit state-vector simulator
// ============================================================

// Minimal complex-number helpers
const cx = (re, im = 0) => ({ re, im });
const cAdd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const cMul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });

class QuantumSandbox {
    constructor() {
        this.n = 3;                 // number of qubits
        this.size = 1 << this.n;    // 8 basis states
        this.circuit = [];          // list of operations
        this.collapsed = null;      // measured basis index, or null

        // 2x2 gate matrices
        const R = Math.SQRT1_2;
        this.gates = {
            H: [[cx(R), cx(R)], [cx(R), cx(-R)]],
            X: [[cx(0), cx(1)], [cx(1), cx(0)]],
            Y: [[cx(0), cx(0, -1)], [cx(0, 1), cx(0)]],
            Z: [[cx(1), cx(0)], [cx(0), cx(-1)]],
            S: [[cx(1), cx(0)], [cx(0), cx(0, 1)]],
            T: [[cx(1), cx(0)], [cx(0), cx(R, R)]]
        };

        // Bail out silently if the markup isn't present
        this.histogramEl = document.getElementById('qc-histogram');
        this.circuitEl = document.getElementById('qc-circuit');
        this.resultEl = document.getElementById('qc-result');
        if (!this.histogramEl || !this.circuitEl) return;

        this.buildHistogram();
        this.bindControls();
        this.render();
    }

    // ---- State computation -------------------------------------------------

    computeState() {
        // Start in |000>
        let state = new Array(this.size).fill(null).map((_, i) => cx(i === 0 ? 1 : 0));
        for (const op of this.circuit) {
            state = op.type === 'cnot'
                ? this.applyCNOT(state, op.control, op.target)
                : this.applyGate(state, this.gates[op.gate], op.qubit);
        }
        return state;
    }

    applyGate(state, U, qubit) {
        const out = state.slice();
        const p = this.n - 1 - qubit; // bit position of this qubit
        for (let i = 0; i < this.size; i++) {
            if ((i >> p) & 1) continue;         // handle each pair once
            const j = i | (1 << p);
            const a = state[i], b = state[j];
            out[i] = cAdd(cMul(U[0][0], a), cMul(U[0][1], b));
            out[j] = cAdd(cMul(U[1][0], a), cMul(U[1][1], b));
        }
        return out;
    }

    applyCNOT(state, control, target) {
        const out = state.slice();
        const pc = this.n - 1 - control;
        const pt = this.n - 1 - target;
        for (let i = 0; i < this.size; i++) {
            if ((i >> pc) & 1) out[i] = state[i ^ (1 << pt)]; // flip target when control set
        }
        return out;
    }

    // ---- Basis-state label, e.g. index 5 -> "101" --------------------------
    label(i) {
        return i.toString(2).padStart(this.n, '0');
    }

    // ---- Rendering ---------------------------------------------------------

    buildHistogram() {
        this.histogramEl.innerHTML = '';
        this.bars = [];
        for (let i = 0; i < this.size; i++) {
            const col = document.createElement('div');
            col.className = 'qc-bar-col';
            col.innerHTML = `
                <div class="qc-bar-prob"></div>
                <div class="qc-bar-track"><div class="qc-bar-fill"></div></div>
                <div class="qc-bar-label">|${this.label(i)}⟩</div>`;
            this.histogramEl.appendChild(col);
            this.bars.push({
                prob: col.querySelector('.qc-bar-prob'),
                fill: col.querySelector('.qc-bar-fill')
            });
        }
    }

    render() {
        // After a measurement the circuit is rebuilt to the collapsed basis
        // state, so computeState() reflects the collapse in every case.
        const state = this.computeState();

        for (let i = 0; i < this.size; i++) {
            const a = state[i];
            const prob = a.re * a.re + a.im * a.im;
            const phase = Math.atan2(a.im, a.re);
            const bar = this.bars[i];

            bar.fill.style.height = `${(prob * 100).toFixed(2)}%`;
            if (prob > 0.0005) {
                const hue = ((phase * 180 / Math.PI) + 360) % 360;
                bar.fill.style.background = `hsl(${hue}, 65%, 55%)`;
                bar.fill.style.opacity = '1';
                bar.prob.textContent = `${(prob * 100).toFixed(0)}%`;
            } else {
                bar.fill.style.opacity = '0.15';
                bar.prob.textContent = '';
            }
        }

        this.renderCircuit();
    }

    renderCircuit() {
        // One row per qubit; one column per operation (moment)
        let html = '';
        for (let q = 0; q < this.n; q++) {
            html += `<div class="qc-wire"><div class="qc-wire-label">q${q}</div>`;
            for (const op of this.circuit) {
                html += `<div class="qc-slot">${this.slotContent(op, q)}</div>`;
            }
            html += `</div>`;
        }
        this.circuitEl.innerHTML = this.circuit.length
            ? html
            : `<div class="qc-empty">Empty circuit — add a gate or pick a preset above.</div>`;
    }

    slotContent(op, q) {
        if (op.type === 'cnot') {
            const lo = Math.min(op.control, op.target);
            const hi = Math.max(op.control, op.target);
            const connector = (q > lo && q <= hi) || (q >= lo && q < hi)
                ? '<span class="qc-connector"></span>' : '';
            if (q === op.control) return `${connector}<span class="qc-dot"></span>`;
            if (q === op.target) return `${connector}<span class="qc-xor">⊕</span>`;
            if (q > lo && q < hi) return connector;
            return '';
        }
        return op.qubit === q ? `<span class="qc-gate qc-gate-${op.gate}">${op.gate}</span>` : '';
    }

    // ---- Actions -----------------------------------------------------------

    addGate(gate, qubit) {
        this.collapsed = null;
        this.clearResult();
        this.circuit.push({ type: 'gate', gate, qubit });
        this.render();
    }

    addCNOT(control, target) {
        if (control === target) {
            this.showResult('Control and target must differ.', true);
            return;
        }
        this.collapsed = null;
        this.clearResult();
        this.circuit.push({ type: 'cnot', control, target });
        this.render();
    }

    undo() {
        this.collapsed = null;
        this.clearResult();
        this.circuit.pop();
        this.render();
    }

    reset() {
        this.collapsed = null;
        this.clearResult();
        this.circuit = [];
        this.render();
    }

    preset(name) {
        this.collapsed = null;
        this.clearResult();
        if (name === 'superposition') {
            this.circuit = [
                { type: 'gate', gate: 'H', qubit: 0 },
                { type: 'gate', gate: 'H', qubit: 1 },
                { type: 'gate', gate: 'H', qubit: 2 }
            ];
        } else if (name === 'bell') {
            this.circuit = [
                { type: 'gate', gate: 'H', qubit: 0 },
                { type: 'cnot', control: 0, target: 1 }
            ];
        } else if (name === 'ghz') {
            this.circuit = [
                { type: 'gate', gate: 'H', qubit: 0 },
                { type: 'cnot', control: 0, target: 1 },
                { type: 'cnot', control: 1, target: 2 }
            ];
        }
        this.render();
    }

    measure() {
        const state = this.computeState();
        const probs = state.map(a => a.re * a.re + a.im * a.im);
        const r = Math.random();
        let acc = 0, outcome = 0;
        for (let i = 0; i < this.size; i++) {
            acc += probs[i];
            if (r <= acc) { outcome = i; break; }
        }
        // Collapse: rebuild circuit as X gates producing the measured basis state
        this.collapsed = outcome;
        this.circuit = [];
        for (let q = 0; q < this.n; q++) {
            if ((outcome >> (this.n - 1 - q)) & 1) {
                this.circuit.push({ type: 'gate', gate: 'X', qubit: q });
            }
        }
        this.render();
        this.showResult(`Measured |${this.label(outcome)}⟩ — state collapsed.`);
    }

    showResult(msg, isError = false) {
        if (!this.resultEl) return;
        this.resultEl.textContent = msg;
        this.resultEl.style.display = 'block';
        this.resultEl.classList.toggle('qc-result-error', isError);
    }

    clearResult() {
        if (this.resultEl) this.resultEl.style.display = 'none';
    }

    // ---- Wiring ------------------------------------------------------------

    bindControls() {
        const qubitSelect = document.getElementById('qc-qubit-select');

        document.querySelectorAll('.qc-gate-btn[data-gate]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addGate(btn.dataset.gate, parseInt(qubitSelect.value, 10));
            });
        });

        document.getElementById('qc-add-cnot').addEventListener('click', () => {
            const control = parseInt(document.getElementById('qc-cnot-control').value, 10);
            const target = parseInt(document.getElementById('qc-cnot-target').value, 10);
            this.addCNOT(control, target);
        });

        document.querySelectorAll('.qc-chip[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => this.preset(btn.dataset.preset));
        });

        document.getElementById('qc-undo').addEventListener('click', () => this.undo());
        document.getElementById('qc-reset').addEventListener('click', () => this.reset());
        document.getElementById('qc-measure').addEventListener('click', () => this.measure());
    }
}


// ============================================================
// ML Simulator — neural network playground (MLP + backprop)
// ============================================================

class MLSimulator {
    constructor() {
        this.canvas = document.getElementById('ml-canvas');
        this.netCanvas = document.getElementById('ml-net-canvas');
        if (!this.canvas || !this.netCanvas) return; // markup not present

        this.ctx = this.canvas.getContext('2d');
        this.netCtx = this.netCanvas.getContext('2d');
        this.W = this.canvas.width;
        this.H = this.canvas.height;

        this.data = [];
        this.lr = 0.3;
        this.dataset = 'circles';
        this.hidden = [16, 16];
        this.epoch = 0;
        this.lastLoss = null;
        this.timer = null;

        // network weights/biases
        this.weights = [];
        this.biases = [];
        this.layerSizes = [];

        // class colors
        this.colorA = [217, 119, 6];  // orange -> class 1
        this.colorB = [37, 99, 235];  // blue   -> class 0

        this.bindControls();
        this.generateData();
        this.buildNet(this.hidden);
        this.render();
    }

    // ---- Math helpers ------------------------------------------------------
    randn() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

    toNorm(px, py) {
        return { nx: (px / this.W) * 2 - 1, ny: -((py / this.H) * 2 - 1) };
    }
    toPx(nx, ny) {
        return { px: (nx + 1) / 2 * this.W, py: (1 - ny) / 2 * this.H };
    }

    // ---- Network -----------------------------------------------------------
    buildNet(hidden) {
        this.layerSizes = [2, ...hidden, 1];
        this.weights = [];
        this.biases = [];
        for (let l = 0; l < this.layerSizes.length - 1; l++) {
            const inS = this.layerSizes[l];
            const outS = this.layerSizes[l + 1];
            const scale = Math.sqrt(2 / (inS + outS)); // Xavier init
            const Wl = [];
            const bl = [];
            for (let i = 0; i < outS; i++) {
                const row = [];
                for (let j = 0; j < inS; j++) row.push(this.randn() * scale);
                Wl.push(row);
                bl.push(0);
            }
            this.weights.push(Wl);
            this.biases.push(bl);
        }
        this.epoch = 0;
        this.lastLoss = null;
    }

    forward(input) {
        const acts = [input];
        let a = input;
        const L = this.weights.length;
        for (let l = 0; l < L; l++) {
            const inS = this.layerSizes[l];
            const outS = this.layerSizes[l + 1];
            const out = new Array(outS);
            for (let i = 0; i < outS; i++) {
                let s = this.biases[l][i];
                for (let j = 0; j < inS; j++) s += this.weights[l][i][j] * a[j];
                out[i] = (l === L - 1) ? this.sigmoid(s) : Math.tanh(s);
            }
            acts.push(out);
            a = out;
        }
        return acts;
    }

    predict(nx, ny) {
        const acts = this.forward([nx, ny]);
        return acts[acts.length - 1][0];
    }

    trainStep() {
        const L = this.weights.length;
        const N = this.data.length;
        if (N === 0) return 0;

        const gW = this.weights.map(m => m.map(row => row.map(() => 0)));
        const gB = this.biases.map(v => v.map(() => 0));
        let loss = 0;

        for (const p of this.data) {
            const acts = this.forward([p.x, p.y]);
            const aL = acts[L][0];
            const y = p.label;
            const ac = Math.min(Math.max(aL, 1e-7), 1 - 1e-7);
            loss += -(y * Math.log(ac) + (1 - y) * Math.log(1 - ac));

            let delta = [aL - y]; // sigmoid + cross-entropy
            for (let l = L - 1; l >= 0; l--) {
                const inS = this.layerSizes[l];
                const outS = this.layerSizes[l + 1];
                for (let i = 0; i < outS; i++) {
                    gB[l][i] += delta[i];
                    for (let j = 0; j < inS; j++) gW[l][i][j] += delta[i] * acts[l][j];
                }
                if (l > 0) {
                    const nd = new Array(inS).fill(0);
                    for (let j = 0; j < inS; j++) {
                        let s = 0;
                        for (let i = 0; i < outS; i++) s += this.weights[l][i][j] * delta[i];
                        nd[j] = s * (1 - acts[l][j] * acts[l][j]); // tanh'
                    }
                    delta = nd;
                }
            }
        }

        const lr = this.lr;
        for (let l = 0; l < L; l++) {
            for (let i = 0; i < this.biases[l].length; i++) {
                this.biases[l][i] -= lr * gB[l][i] / N;
                for (let j = 0; j < this.weights[l][i].length; j++) {
                    this.weights[l][i][j] -= lr * gW[l][i][j] / N;
                }
            }
        }
        this.epoch++;
        this.lastLoss = loss / N;
        return this.lastLoss;
    }

    accuracy() {
        if (this.data.length === 0) return null;
        let correct = 0;
        for (const p of this.data) {
            if ((this.predict(p.x, p.y) > 0.5 ? 1 : 0) === p.label) correct++;
        }
        return correct / this.data.length;
    }

    // ---- Datasets ----------------------------------------------------------
    generateData() {
        this.data = [];
        const noise = (s) => (Math.random() - 0.5) * s;
        const n = 70;

        if (this.dataset === 'spiral') {
            for (let arm = 0; arm < 2; arm++) {
                for (let i = 0; i < n; i++) {
                    const r = (i / n) * 0.9;
                    const a = (i / n) * 3.2 * Math.PI + arm * Math.PI;
                    this.data.push({
                        x: r * Math.cos(a) + noise(0.06),
                        y: r * Math.sin(a) + noise(0.06),
                        label: arm === 0 ? 1 : 0
                    });
                }
            }
        } else if (this.dataset === 'moons') {
            for (let i = 0; i < n; i++) {
                const t = Math.PI * (i / (n - 1));
                this.data.push({ x: 0.7 * Math.cos(t) - 0.25 + noise(0.08), y: 0.7 * Math.sin(t) - 0.2 + noise(0.08), label: 1 });
                this.data.push({ x: 0.7 * Math.cos(t) + 0.25 + noise(0.08), y: -0.7 * Math.sin(t) + 0.2 + noise(0.08), label: 0 });
            }
        } else if (this.dataset === 'circles') {
            for (let i = 0; i < n; i++) {
                const a = Math.random() * 2 * Math.PI;
                const rIn = Math.random() * 0.35;
                this.data.push({ x: rIn * Math.cos(a), y: rIn * Math.sin(a), label: 1 });
                const rOut = 0.6 + Math.random() * 0.3;
                this.data.push({ x: rOut * Math.cos(a), y: rOut * Math.sin(a), label: 0 });
            }
        } else if (this.dataset === 'xor') {
            for (let i = 0; i < 2 * n; i++) {
                const x = (Math.random() * 2 - 1) * 0.9;
                const y = (Math.random() * 2 - 1) * 0.9;
                this.data.push({ x, y, label: (x * y > 0) ? 1 : 0 });
            }
        }
    }

    // ---- Rendering ---------------------------------------------------------
    render() {
        this.drawSurface();
        this.drawNet();
        this.updateStats();
    }

    lerpColor(t) {
        // blue -> white -> orange, gives a light middle band near p=0.5
        const white = [250, 248, 245];
        let c;
        if (t < 0.5) {
            const k = t * 2;
            c = this.colorB.map((v, i) => v + (white[i] - v) * k);
        } else {
            const k = (t - 0.5) * 2;
            c = white.map((v, i) => v + (this.colorA[i] - v) * k);
        }
        return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, 0.75)`;
    }

    drawSurface() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        const step = 8;
        for (let px = 0; px < this.W; px += step) {
            for (let py = 0; py < this.H; py += step) {
                const { nx, ny } = this.toNorm(px + step / 2, py + step / 2);
                ctx.fillStyle = this.lerpColor(this.predict(nx, ny));
                ctx.fillRect(px, py, step, step);
            }
        }

        // data points
        for (const p of this.data) {
            const { px, py } = this.toPx(p.x, p.y);
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            const c = p.label === 1 ? this.colorA : this.colorB;
            ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#faf8f5';
            ctx.stroke();
        }
    }

    drawNet() {
        const ctx = this.netCtx;
        const W = this.netCanvas.width;
        const H = this.netCanvas.height;
        ctx.clearRect(0, 0, W, H);

        const nL = this.layerSizes.length;
        const marginX = 34;
        const colGap = (W - 2 * marginX) / (nL - 1);
        const maxNodes = Math.max(...this.layerSizes);
        const nodeGap = H / (maxNodes + 1);
        const radius = Math.min(9, nodeGap * 0.38);

        const nodePos = (l, i) => {
            const count = this.layerSizes[l];
            const totalH = (count - 1) * nodeGap;
            return { x: marginX + l * colGap, y: H / 2 - totalH / 2 + i * nodeGap };
        };

        // connections
        for (let l = 0; l < nL - 1; l++) {
            const inS = this.layerSizes[l];
            const outS = this.layerSizes[l + 1];
            for (let i = 0; i < outS; i++) {
                for (let j = 0; j < inS; j++) {
                    const w = this.weights[l][i][j];
                    const a = nodePos(l, j);
                    const b = nodePos(l + 1, i);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    const mag = Math.min(Math.abs(w), 3);
                    ctx.lineWidth = 0.3 + mag * 1.1;
                    const col = w >= 0 ? this.colorA : this.colorB;
                    ctx.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.15 + Math.min(mag / 3, 1) * 0.6})`;
                    ctx.stroke();
                }
            }
        }

        // nodes
        for (let l = 0; l < nL; l++) {
            for (let i = 0; i < this.layerSizes[l]; i++) {
                const p = nodePos(l, i);
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#faf8f5';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#d97706';
                ctx.stroke();
            }
        }
    }

    updateStats() {
        document.getElementById('ml-epoch').textContent = `Epoch ${this.epoch}`;
        document.getElementById('ml-loss').textContent =
            this.lastLoss === null ? 'Loss —' : `Loss ${this.lastLoss.toFixed(3)}`;
        const acc = this.accuracy();
        document.getElementById('ml-acc').textContent =
            acc === null ? 'Accuracy —' : `Accuracy ${(acc * 100).toFixed(0)}%`;
    }

    // ---- Actions -----------------------------------------------------------
    startTraining() {
        if (this.timer) { this.stopTraining(); return; }
        this.setTrainLabel(true);
        this.timer = setInterval(() => {
            for (let k = 0; k < 5; k++) this.trainStep(); // a few steps per frame
            this.render();
            if (this.epoch > 8000) this.stopTraining();
        }, 60);
    }

    stopTraining() {
        clearInterval(this.timer);
        this.timer = null;
        this.setTrainLabel(false);
    }

    setTrainLabel(training) {
        const btn = document.getElementById('ml-train');
        btn.innerHTML = training
            ? "<i class='bx bx-pause'></i> Stop"
            : "<i class='bx bx-play'></i> Train";
    }

    reset() {
        this.stopTraining();
        this.buildNet(this.hidden);
        this.render();
    }

    setDataset(name) {
        this.stopTraining();
        this.dataset = name;
        this.generateData();
        this.buildNet(this.hidden);
        this.render();
    }

    setArch(sizes) {
        this.stopTraining();
        this.hidden = sizes;
        this.buildNet(this.hidden);
        this.render();
    }

    // ---- Wiring ------------------------------------------------------------
    bindControls() {
        document.querySelectorAll('.ml-chip[data-dataset]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ml-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setDataset(btn.dataset.dataset);
            });
        });

        document.getElementById('ml-arch').addEventListener('change', (e) => {
            const sizes = e.target.value.split(',').map(v => parseInt(v, 10));
            this.setArch(sizes);
        });

        const lr = document.getElementById('ml-lr');
        const lrValue = document.getElementById('ml-lr-value');
        lr.addEventListener('input', () => {
            this.lr = parseInt(lr.value, 10) / 100;
            lrValue.textContent = this.lr.toFixed(2);
        });

        document.getElementById('ml-train').addEventListener('click', () => this.startTraining());
        document.getElementById('ml-reset').addEventListener('click', () => this.reset());
    }
}

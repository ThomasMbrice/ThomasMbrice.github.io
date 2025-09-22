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
            console.log('Loaded projects:', this.allProjects.length);
            
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
        console.log(`Section ${index}: category="${section.dataset.category}", display="${section.style.display}"`);
    });
    
    sections.forEach((section, index) => {
        const sectionCategory = section.dataset.category;
        
        if (sectionCategory === category) {
            section.style.display = 'block';
            // Removed: section.style.backgroundColor = 'lightgreen';
            console.log(`✓ SHOWING section: ${sectionCategory}`);
        } else {
            section.style.display = 'none';
            // Removed: section.style.backgroundColor = 'lightcoral';
            console.log(`✗ HIDING section: ${sectionCategory}`);
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
    new LinkedInPosts(); 
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
            console.log('🔍 Fetching GitHub activity...');
            
            // GitHub Events API - public, no auth needed!
            const response = await fetch(`https://api.github.com/users/${this.username}/events?per_page=20`);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const events = await response.json();
            console.log('✅ GitHub events received:', events.length);
            
            // Transform GitHub events to activities
            this.activities = this.parseGitHubEvents(events);
            console.log('✅ Activities processed:', this.activities.length);
            
        } catch (error) {
            console.error('❌ Failed to fetch GitHub activity:', error);
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
            console.error('❌ sidebar-posts container not found!');
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
        
        console.log('🎨 Displaying', this.activities.length, 'activities');
        
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
        
        console.log('✅ GitHub activity displayed successfully!');
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
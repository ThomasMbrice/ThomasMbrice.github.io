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


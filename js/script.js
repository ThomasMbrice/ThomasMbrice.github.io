let menuIcon = document.querySelector("#menu-icon");
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navlinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop -150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height){
            navlinks.forEach(links =>{
                links.classList.remove('active');
                document.querySelectorAll('header nav a [href*=' + id +" ]")
                .classList.add('active')
            })
        }
    })
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

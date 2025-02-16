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
});

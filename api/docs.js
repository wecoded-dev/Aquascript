
// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const docsSidebar = document.getElementById('docsSidebar');

mobileMenuBtn.addEventListener('click', () => {
    docsSidebar.classList.toggle('active');
    mobileMenuBtn.innerHTML = docsSidebar.classList.contains('active') ?
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (docsSidebar.classList.contains('active')) {
            docsSidebar.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }

        // Scroll to section
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        // Update active nav item
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// Highlight current section in sidebar while scrolling
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.api-section');
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= (sectionTop - 300)) {
            currentSection = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

// Initialize with first section active
document.querySelector('.nav-link').classList.add('active');

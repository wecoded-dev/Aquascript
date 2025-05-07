// This script is used to collapse the navbar on mobile devices when a link is clicked.
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                toggle: false
            });
            bsCollapse.hide();
        });
    });
});


//This script is used to open social media links in a new tab when clicked.
// The links are inside a div with the class "social-links".
document.addEventListener('DOMContentLoaded', function() {
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        window.open(this.href, '_blank');
      });
    });
  });


// Cookie Consent Functions
function showCookieBar() {
const bar = document.getElementById('cookieConsent');
bar.style.bottom = '0';
bar.style.opacity = '1';
}

function acceptCookies() {
const bar = document.getElementById('cookieConsent');
const acceptBtn = document.getElementById('acceptBtn');
const declineBtn = document.getElementById('declineBtn');
const tick = document.getElementById('checkMark');

localStorage.setItem('cookiesAccepted', 'true');

acceptBtn.disabled = true;
declineBtn.disabled = true;
acceptBtn.innerText = 'Accepted';
acceptBtn.style.background = 'linear-gradient(135deg, #00d4ff, #00a86b)';
tick.style.display = 'inline';

setTimeout(() => {
    bar.style.opacity = '0';
    bar.style.bottom = '-100px';
}, 1500);
}

function declineCookies() {
const bar = document.getElementById('cookieConsent');
localStorage.setItem('cookiesAccepted', 'false');

setTimeout(() => {
    bar.style.opacity = '0';
    bar.style.bottom = '-100px';
}, 300);
}

// Initialize on page load
window.onload = function() {
if (!localStorage.getItem('cookiesAccepted')) {
    setTimeout(showCookieBar, 1000);
}
};

// Event listeners
document.getElementById('acceptBtn').addEventListener('click', acceptCookies);
document.getElementById('declineBtn').addEventListener('click', declineCookies);

// Handle hover effects
document.getElementById('acceptBtn').addEventListener('mouseenter', function() {
this.style.transform = 'translateY(-2px)';
this.style.boxShadow = '0 4px 12px rgba(0, 247, 255, 0.3)';
});
document.getElementById('acceptBtn').addEventListener('mouseleave', function() {
this.style.transform = '';
this.style.boxShadow = '';
});

document.getElementById('declineBtn').addEventListener('mouseenter', function() {
this.style.transform = 'translateY(-2px)';
this.style.background = 'rgba(255, 255, 255, 0.15)';
});
document.getElementById('declineBtn').addEventListener('mouseleave', function() {
this.style.transform = '';
this.style.background = 'rgba(255, 255, 255, 0.1)';
});
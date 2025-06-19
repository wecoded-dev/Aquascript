// Advertisement/Ads.js
// This script handles the contact form submission and animations on the page
// Form submission handler
document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const feedback = document.getElementById('formFeedback');
    const submitBtn = form.querySelector('button');

    // Reset feedback
    feedback.textContent = '';
    feedback.className = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

    // Prepare form data
    const formData = new FormData(form);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            feedback.textContent = 'Your message has been sent successfully. Thank you!';
            feedback.classList.add('success');
            form.reset();

            // Confetti effect
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else {
            feedback.textContent = 'Failed to send message. Please try again later.';
            feedback.classList.add('error');
        }
    } catch (error) {
        feedback.textContent = 'An error occurred. Please check your internet connection and try again.';
        feedback.classList.add('error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
});

// Add confetti library if not already loaded
if (typeof confetti === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
    document.head.appendChild(script);
}

// Animate elements when they come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate__animated');

    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;

        if (elementPosition < screenPosition) {
            const animation = element.getAttribute('data-animation');
            element.classList.add(animation || 'animate__fadeIn');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

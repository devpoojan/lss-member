import './firebase.js';
console.log('Shree Lalabapa Seva Samiti Web App Initialized');


// Header Scroll Effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(102, 0, 0, 0.95)';
        header.style.padding = '1rem 5%';
    } else {
        header.style.background = 'rgba(139, 0, 0, 0.85)';
        header.style.padding = '1.5rem 5%';
    }
});

// Intersection Observer for fade-in effects
const sections = document.querySelectorAll('section');
const options = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, options);

sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.8s ease-out';
    observer.observe(section);
});

// Special treatment for the main coin
const coin = document.querySelector('.main-coin');
if (coin) {
    coin.style.opacity = '1'; // Keep coin visible from the start
    coin.style.transform = 'translateY(0)';
}

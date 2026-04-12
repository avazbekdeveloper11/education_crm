// Cursor Glow Effect
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
});

// Navbar Scroll Effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < triggerBottom) {
            el.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// Performance optimization: Throttle scroll event
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            revealOnScroll();
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Mockup Parallax Effect
const mockup = document.querySelector('.mockup-container');
window.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    mockup.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

window.addEventListener('mouseenter', () => {
    mockup.style.transition = 'none';
});

window.addEventListener('mouseleave', () => {
    mockup.style.transition = 'all 0.5s ease';
    mockup.style.transform = `rotateY(0deg) rotateX(5deg)`;
});

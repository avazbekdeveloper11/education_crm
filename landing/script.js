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

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const phone = document.getElementById('form-phone').value;
        const desc = document.getElementById('form-desc').value;
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        formStatus.textContent = "Yuborilmoqda...";
        formStatus.className = "";

        const botToken = '8529300465:AAHr2v7iG-eCrBlB6nYzE7JHD-h_-vXY0dw';
        const chatId = '-1003988940257';
        
        const message = `📩 <b>YANGI LANDING SO'ROVI</b>\n\n` +
            `👤 Ism: <b>${name}</b>\n` +
            `📞 Telefon: <code>${phone}</code>\n` +
            `📝 Xabar: ${desc || "Yo'q"}\n` +
            `🕐 Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            if (response.ok) {
                formStatus.textContent = "Muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.";
                formStatus.className = "success";
                contactForm.reset();
            } else {
                throw new Error();
            }
        } catch (error) {
            formStatus.textContent = "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring yoki telefon orqali bog'laning.";
            formStatus.className = "error";
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
}

// Cursor Glow Effect
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    if (glow) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
    }
});

// Navbar Scroll Effect
const nav = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');
const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (menuIcon) {
            const currentIcon = navLinks.classList.contains('active') ? 'x' : 'menu';
            menuIcon.setAttribute('data-lucide', currentIcon);
            lucide.createIcons();
        }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    });
}

window.addEventListener('scroll', () => {
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
});

// Scroll Reveal Animation (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal');
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

revealElements.forEach(el => observer.observe(el));

// Hero Parallax Effect
const mockup = document.querySelector('.mockup-container');
if (mockup) {
    window.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
        mockup.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis + 2}deg)`;
    });

    window.addEventListener('mouseleave', () => {
        mockup.style.transition = 'all 1s ease';
        mockup.style.transform = `perspective(1000px) rotateY(0deg) rotateX(2deg)`;
    });
    
    window.addEventListener('mouseenter', () => {
        mockup.style.transition = 'none';
    });
}

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
const phoneInput = document.getElementById('form-phone');

if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let input = e.target.value.replace(/\D/g, '').substring(0, 12);
        
        if (input.length === 0) {
            e.target.value = '';
            return;
        }
        
        if (!input.startsWith('998')) {
            input = '998' + input;
        }
        
        let format = '+998';
        if (input.length > 3) format += ' ' + input.substring(3, 5);
        if (input.length > 5) format += ' ' + input.substring(5, 8);
        if (input.length > 8) format += ' ' + input.substring(8, 10);
        if (input.length > 10) format += ' ' + input.substring(10, 12);
        
        e.target.value = format;
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const phone = document.getElementById('form-phone').value;
        const desc = document.getElementById('form-desc').value;
        
        // UI Feedback
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
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
                formStatus.textContent = "Muvaffaqiyatli yuborildi! Tez orada bog'lanamiz.";
                formStatus.className = "success";
                contactForm.reset();
            } else {
                throw new Error();
            }
        } catch (error) {
            formStatus.textContent = "Xatolik! Qaytadan urinib ko'ring.";
            formStatus.className = "error";
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
}

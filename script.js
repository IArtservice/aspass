let menuData = [];
let lang = 'it';
let currentFilter = 'all';

const categories = {
    caffetteria: { it: "Caffetteria", en: "Coffee & Tea", icon: "☕", allergens: "su richiesta" },
    brioches: { it: "Le Nostre Brioches", en: "Our Pastries", icon: "🥐", allergens: "glutine, lattosio, uova" },
    bibite: { it: "Bibite", en: "Soft Drinks", icon: "🥤", allergens: "" },
    aperitivi: { it: "Aperitivi & Taglieri", en: "Aperitifs & Platters", icon: "🍸", allergens: "solfiti, lattosio (nei formaggi)" },
    panini: { it: "Panini & Toast", en: "Sandwiches & Toast", icon: "🥪", allergens: "glutine, lattosio" },
    piadine: { it: "Piadine", en: "Piadinas", icon: "🫓", allergens: "glutine, lattosio" },
    insalate: { it: "Insalatone", en: "Salads", icon: "🥗", allergens: "su richiesta" },
    cucina: { it: "Cucina", en: "Kitchen", icon: "🍝", allergens: "glutine, lattosio, uova" }
};

const categoryOrder = ["caffetteria","brioches","bibite","aperitivi","panini","piadine","insalate","cucina"];

const bgImages = {
    all: "aspass.jpg",
    caffetteria: "caffetteria.jpg",
    brioches: "brioches.jpg",
    bibite: "bibite.jpg",
    aperitivi: "aperitivi.jpg",
    panini: "panini.jpg",
    piadine: "piadine.jpg",
    insalate: "insalate.jpg",
    cucina: "cucina.jpg"
};

const colorCache = {};
const imageCache = {};
let currentBgUrl = bgImages["all"];
let bgSwapping = false;

function getAverageColor(imgSrc, callback) {
    if (colorCache[imgSrc]) { callback(colorCache[imgSrc]); return; }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        const step = 20 * 4;
        let count = 0;
        for (let i = 0; i < data.length; i += step) {
            r += data[i]; g += data[i+1]; b += data[i+2];
            count++;
        }
        r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count);
        const color = `rgb(${r},${g},${b})`;
        colorCache[imgSrc] = color;
        callback(color);
    };
    img.onerror = function() { callback('#1a1008'); };
    img.src = imgSrc;
}

function preloadImage(url) {
    if (!url || imageCache[url]) return;
    imageCache[url] = true;
    const img = new Image();
    img.src = url;
}

function preloadAllBgImages() {
    const urls = [...new Set(Object.values(bgImages))];
    urls.forEach(url => preloadImage(url));
}

function updateBackgroundForCategory(category) {
    const newUrl = bgImages[category] || bgImages["all"];
    if (newUrl === currentBgUrl && category !== 'all') return;
    if (bgSwapping) return;
    bgSwapping = true;
    currentBgUrl = newUrl;
    preloadImage(newUrl);
    
    const bg1 = document.getElementById('bg1');
    const bg2 = document.getElementById('bg2');
    if (!bg1 || !bg2) return;
    
    const activeBg = bg1.classList.contains('active') ? bg1 : bg2;
    const nextBg = activeBg === bg1 ? bg2 : bg1;
    
    nextBg.style.backgroundImage = `url('${newUrl}')`;
    getAverageColor(newUrl, (color) => {
        document.body.style.backgroundColor = color;
    });
    
    void nextBg.offsetWidth;
    nextBg.classList.add('active');
    setTimeout(() => {
        activeBg.classList.remove('active');
        bgSwapping = false;
    }, 600);
}

function getText(item, field) {
    if (lang === 'en' && item[field+'_en']) return item[field+'_en'];
    return item[field];
}

function updateStaticTexts() {
    const footerAllergen = document.getElementById('footerAllergenMsg');
    const footerCopyright = document.getElementById('footerCopyrightMsg');
    const creditSpan = document.getElementById('creditSpan');
    const headerSub = document.getElementById('headerSub');
    const splashSub = document.getElementById('splashSub');
    if (lang === 'it') {
        footerAllergen.innerHTML = "Allergeni indicati per categoria. Chiedi al personale per dettagli.";
        footerCopyright.innerHTML = "© Bar Aspass · Caffè e Cucina · dal 2024";
        creditSpan.innerHTML = 'Creato da <a href="https://www.iartservice.com" target="_blank">IArtService.com</a>';
        headerSub.innerText = "Caffè e Cucina · Aperitivi";
        splashSub.innerText = "Caffè e Cucina · Aperitivi";
    } else {
        footerAllergen.innerHTML = "Allergens shown by category. Ask staff for details.";
        footerCopyright.innerHTML = "© Bar Aspass · Coffee & Food · since 2024";
        creditSpan.innerHTML = 'Created by <a href="https://www.iartservice.com" target="_blank">IArtService.com</a>';
        headerSub.innerText = "Coffee & Food · Aperitifs";
        splashSub.innerText = "Coffee & Food · Aperitifs";
    }
}

function renderMenu() {
    const container = document.getElementById('menuContainer');
    let html = '';
    for (let cat of categoryOrder) {
        const items = menuData.filter(i => i.category === cat);
        if (items.length === 0) continue;
        if (currentFilter !== 'all' && currentFilter !== cat) continue;
        
        const sectionTitle = categories[cat][lang];
        const icon = categories[cat].icon;
        const allergenText = categories[cat].allergens || '';
        const allergenLabel = lang === 'it' ? 'Allergeni:' : 'Allergens:';
        
        html += `<div class="menu-section" data-cat="${cat}">
                    <div class="section-title">${icon} ${sectionTitle}</div>`;
        
        if (allergenText) {
            html += `<div class="allergens">⚠️ ${allergenLabel} ${allergenText}</div>`;
        }
        
        html += `<div class="menu-list">`;
        for (let item of items) {
            const name = getText(item, 'name');
            const desc = getText(item, 'desc');
            const price = item.price || '';
            const priceClass = price ? '' : ' empty-price';
            const priceDisplay = price || (lang === 'it' ? 'prezzo su richiesta' : 'price on request');
            html += `<div class="menu-item" data-cat="${cat}">
                        <div class="spotlight"></div>
                        <div class="item-name">${name}</div>
                        ${desc ? `<div class="item-desc">${desc}</div>` : ''}
                        <div class="item-price${priceClass}">${priceDisplay}</div>
                     </div>`;
        }
        html += `</div></div>`;
    }
    container.innerHTML = html || '<div style="padding:2rem;text-align:center;color:#c0a080">Nessun piatto in questa categoria</div>';

    gsap.fromTo('.menu-section', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 });
    gsap.fromTo('.menu-item', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, delay: 0.3 });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const cat = this.dataset.cat;
            let emoji = '✨';
            const icons = {
                caffetteria: '☕',
                brioches: '🥐',
                bibite: '🥤',
                aperitivi: '🍸',
                panini: '🥪',
                piadine: '🫓',
                insalate: '🥗',
                cucina: '🍝'
            };
            emoji = icons[cat] || '✨';
            
            const el = document.createElement('div');
            el.className = 'click-effect';
            el.textContent = emoji;
            el.style.left = e.clientX + 'px';
            el.style.top = e.clientY + 'px';
            el.style.fontSize = (Math.random() * 2 + 2) + 'rem';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 900);
        });
    });
}

function renderFilters() {
    const bar = document.getElementById('filterBar');
    const allLabel = lang === 'it' ? 'TUTTO' : 'ALL';
    let buttonsHtml = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-cat="all">${allLabel}</button>`;
    buttonsHtml += categoryOrder.map(cat => {
        const label = categories[cat][lang];
        return `<button class="filter-btn ${currentFilter === cat ? 'active' : ''}" data-cat="${cat}">${label}</button>`;
    }).join('');
    bar.innerHTML = buttonsHtml;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());

            currentFilter = this.dataset.cat;
            renderFilters();
            renderMenu();
            updateBackgroundForCategory(currentFilter);
            const target = document.querySelector('.menu-section:not(.hidden)');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function updateLanguage() {
    renderFilters();
    renderMenu();
    updateStaticTexts();
    document.getElementById('langToggle').innerHTML = lang === 'it' ? '🇬🇧' : '🇮🇹';
}

// Particelle
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
const maxParticles = 30;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = Math.random() * 0.4 + 0.05;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = Math.random() < 0.6 ? '212, 160, 80' : '232, 200, 138';
    }
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
            this.reset();
            this.y = canvas.height + 10;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(212, 160, 80, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initParticles() {
    particles = Array.from({ length: maxParticles }, () => new Particle());
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

let aperitivoActive = false;
document.getElementById('aperitivoBtn').addEventListener('click', function() {
    if (aperitivoActive) return;
    aperitivoActive = true;

    const emojis = ['🍸','🥂','🍹','🍾','✨','🥳','🍷','🍺','🥃','🍋','🫒','🧀','🥖'];
    for (let i = 0; i < 40; i++) {
        const el = document.createElement('div');
        el.className = 'click-effect';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = (Math.random() * window.innerWidth) + 'px';
        el.style.top = (Math.random() * window.innerHeight) + 'px';
        el.style.fontSize = (Math.random() * 3 + 1.5) + 'rem';
        el.style.animationDuration = (Math.random() * 1.2 + 0.8) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }

    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed; inset:0; background:rgba(232,200,138,0.25); z-index:155; pointer-events:none;';
    document.body.appendChild(flash);
    gsap.fromTo(flash, { opacity: 0 }, { opacity: 0.6, duration: 0.3, yoyo: true, repeat: 1, onComplete: () => flash.remove() });

    for (let i = 0; i < 10; i++) {
        const p = new Particle();
        p.x = window.innerWidth/2 + (Math.random() - 0.5) * 300;
        p.y = window.innerHeight/2 + (Math.random() - 0.5) * 300;
        p.speedX = (Math.random() - 0.5) * 5;
        p.speedY = (Math.random() - 0.5) * 5;
        p.size = Math.random() * 4 + 2;
        p.opacity = 1;
        p.color = ['255, 200, 50', '255, 150, 50', '255, 100, 50', '200, 180, 100'][Math.floor(Math.random() * 4)];
        particles.push(p);
    }

    setTimeout(() => {
        particles = particles.filter(p => p.color.includes('212') || p.color.includes('232'));
        while (particles.length < maxParticles) particles.push(new Particle());
        aperitivoActive = false;
    }, 4000);
});

window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    const goTop = document.getElementById('goTopBtn');
    if (window.scrollY > 500) goTop.classList.add('show');
    else goTop.classList.remove('show');
});
document.getElementById('goTopBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('langToggle').addEventListener('click', () => {
    lang = lang === 'it' ? 'en' : 'it';
    updateLanguage();
});

let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const diff = scrollY - lastScrollY;
    const activeBg = document.getElementById('bg1').classList.contains('active') ? document.getElementById('bg1') : document.getElementById('bg2');
    const currentPos = parseFloat(activeBg.style.backgroundPositionY) || 50;
    let newPos = currentPos + diff * 0.02;
    newPos = Math.min(70, Math.max(30, newPos));
    activeBg.style.backgroundPositionY = newPos + '%';
    lastScrollY = scrollY;
});

document.getElementById('logoImg').onerror = function() {
    this.style.display = 'none';
    document.getElementById('logoFallback').style.display = 'block';
};

async function loadAndInit() {
    try {
        const response = await fetch('menu.json');
        const data = await response.json();
        menuData = data.map(item => {
            if (item.name) item.name = item.name.toUpperCase();
            if (item.name_en) item.name_en = item.name_en.toUpperCase();
            return item;
        });
        
        preloadAllBgImages();
        const initialBg = bgImages["all"];
        currentBgUrl = initialBg;
        const bg1 = document.getElementById('bg1');
        if (bg1) bg1.style.backgroundImage = `url('${initialBg}')`;
        getAverageColor(initialBg, (color) => {
            document.body.style.backgroundColor = color;
        });
        
        renderFilters();
        renderMenu();
        updateBackgroundForCategory('all');
        updateStaticTexts();
        
        const splash = document.getElementById('splash');
        const body = document.body;
        setTimeout(() => {
            splash.classList.add('hidden');
            body.classList.add('loaded');
        }, 1500);
    } catch (error) {
        console.error('Errore nel caricamento del menu:', error);
        document.getElementById('menuContainer').innerHTML = '<div style="padding:2rem;text-align:center;color:#d4a050">Errore nel caricamento del menu. Ricarica la pagina.</div>';
        setTimeout(() => {
            document.getElementById('splash').classList.add('hidden');
            document.body.classList.add('loaded');
        }, 1500);
    }
}

loadAndInit();
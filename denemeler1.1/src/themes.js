// themes.js
const themes = {
    'cosmic-purple': {
        primary: '#1a1423',
        secondary: '#2D1B36',
        accent: '#9B6B9E',
        light: '#E5B8F4',
        border: '#4A3B4E',
        background: '#0d0b14',
        gradient: 'linear-gradient(to right, #1a1423, #2D1B36)'
    },
    'exam-tracker': {
        primary: '#765D67',
        secondary: '#6D3C52',
        accent: '#4B2138',
        light: '#FADCD5',
        border: '#2D222F',
        background: '#200107',
        gradient: 'linear-gradient(to right, #765D67, #6D3C52)'
    },
    'metalic-gold-pink': {
        primary: '#d4c29a',
        secondary: '#6D3C52',
        accent: '#4B2138',
        light: '#fbffae',
        border: '#2D222F',
        background: '#5b4a5e',
        gradient: 'linear-gradient(to right, #d4c29a, #6D3C52)'
    },
    'ocean': {
        primary: '#2c3e50',
        secondary: '#3498db',
        accent: '#3498db',
        light: '#bdc3c7',
        border: '#34495e',
        background: '#1a1f2a',
        gradient: 'linear-gradient(to right, #2c3e50, #3498db)'
    },
    'night-mode': {
        primary: '#232526',
        secondary: '#414345',
        accent: '#3d453f',
        light: '#ffffff',
        border: '#444',
        background: '#232526',
        gradient: 'linear-gradient(to right, #232526, #414345)'
    },
    'nebula': {
        primary: '#2D1B36',
        secondary: '#B86AF9',
        accent: '#B86AF9',
        light: '#E5B8F4',
        border: '#513960',
        background: '#1a1a1a',
        gradient: 'linear-gradient(45deg, #2D1B36, #B86AF9)'
    },
    'starlight': {
        primary: '#1E1E2E',
        secondary: '#A387CC',
        accent: '#A387CC',
        light: '#E2D5F8',
        border: '#463B5C',
        background: '#1a1a2e',
        gradient: 'linear-gradient(to right, #1E1E2E, #A387CC)'
    }
};

// ThemeManager sınıfı
class ThemeManager {
    constructor() {
        this.themes = themes;
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        document.documentElement.style.setProperty('--primary', theme.primary);
        document.documentElement.style.setProperty('--secondary', theme.secondary);
        document.documentElement.style.setProperty('--accent', theme.accent);
        document.documentElement.style.setProperty('--light', theme.light);
        document.documentElement.style.setProperty('--border', theme.border);
        document.documentElement.style.setProperty('--background', theme.background);
        document.documentElement.style.setProperty('--gradient', theme.gradient);

        localStorage.setItem('selectedTheme', themeName);
    }

    getCurrentTheme() {
        return localStorage.getItem('selectedTheme') || 'exam-tracker';
    }

    changeTheme(themeName) {
        this.applyTheme(themeName);
    }
}

// Global tema yöneticisi örneği oluştur
const themeManager = new ThemeManager();

// Sayfa geçiş animasyonu için sınıf
class PageTransition {
    constructor() {
        // Ana sayfada animasyonu devre dışı bırak
        if (window.location.pathname.includes('home.html')) {
            return;
        }
        this.setupTransition();
    }

    setupTransition() {
        // Ana içerik div'ini oluştur
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform: translateX(0);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 2;
            will-change: transform;
        `;
        
        // Mevcut sayfanın içeriğini wrapper'a taşı
        while (document.body.firstChild) {
            wrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(wrapper);
        
        // Preview iframe'i oluştur
        const preview = document.createElement('iframe');
        preview.src = 'home.html';
        preview.style.cssText = `
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            border: none;
            z-index: 1;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            background: var(--background);
            will-change: transform;
        `;

        // Preview için özel stil
        const previewStyle = document.createElement('style');
        previewStyle.textContent = `
            iframe {
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
        `;
        document.head.appendChild(previewStyle);
        document.body.insertBefore(preview, wrapper);

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let animationFrame;

        const updateTransform = (x) => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            
            animationFrame = requestAnimationFrame(() => {
                wrapper.style.transform = `translateX(${x}px)`;
                preview.style.transform = `translateX(${x}px)`;
            });
        };

        const finishTransition = (shouldNavigate) => {
            wrapper.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            preview.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

            if (shouldNavigate) {
                updateTransform(window.innerWidth);
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 450);
            } else {
                updateTransform(0);
            }
        };

        // Dokunmatik ekran için
        document.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            isDragging = true;
            wrapper.style.transition = 'none';
            preview.style.transition = 'none';
        }, { passive: true });
        
        document.addEventListener('touchmove', e => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX - startX;
            if (currentX > 0) {
                updateTransform(currentX);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            finishTransition(currentX > window.innerWidth / 3);
        });
        
        // Mouse için
        document.addEventListener('mousedown', e => {
            startX = e.clientX;
            isDragging = true;
            wrapper.style.transition = 'none';
            preview.style.transition = 'none';
        });
        
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            
            currentX = e.clientX - startX;
            if (currentX > 0) {
                updateTransform(currentX);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            
            finishTransition(currentX > window.innerWidth / 3);
        });

        // Bellek temizliği
        window.addEventListener('beforeunload', () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        });
    }
}

// Global değişkenler
window.themeManager = themeManager;
window.themes = themes;

// Sayfa yüklendiğinde geçiş animasyonunu başlat
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
});

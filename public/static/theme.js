// TaskBoard Theme System
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    primary: '#6366f1',
                    secondary: '#a855f7',
                    background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
                    cardBg: 'rgba(255, 255, 255, 0.9)',
                    listBg: 'rgba(255, 255, 255, 0.3)',
                    text: '#1f2937',
                    textMuted: '#6b7280'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    primary: '#818cf8',
                    secondary: '#c084fc',
                    background: 'linear-gradient(-45deg, #1e1b4b, #312e81, #581c87, #831843)',
                    cardBg: 'rgba(30, 41, 59, 0.9)',
                    listBg: 'rgba(30, 41, 59, 0.3)',
                    text: '#f1f5f9',
                    textMuted: '#94a3b8'
                }
            },
            ocean: {
                name: 'Ocean',
                colors: {
                    primary: '#06b6d4',
                    secondary: '#0891b2',
                    background: 'linear-gradient(-45deg, #0891b2, #0e7490, #155e75, #164e63)',
                    cardBg: 'rgba(224, 242, 254, 0.9)',
                    listBg: 'rgba(224, 242, 254, 0.3)',
                    text: '#0c4a6e',
                    textMuted: '#0e7490'
                }
            },
            forest: {
                name: 'Forest',
                colors: {
                    primary: '#10b981',
                    secondary: '#059669',
                    background: 'linear-gradient(-45deg, #047857, #059669, #10b981, #34d399)',
                    cardBg: 'rgba(220, 252, 231, 0.9)',
                    listBg: 'rgba(220, 252, 231, 0.3)',
                    text: '#064e3b',
                    textMuted: '#047857'
                }
            },
            sunset: {
                name: 'Sunset',
                colors: {
                    primary: '#f97316',
                    secondary: '#ea580c',
                    background: 'linear-gradient(-45deg, #dc2626, #ea580c, #f97316, #fb923c)',
                    cardBg: 'rgba(254, 243, 199, 0.9)',
                    listBg: 'rgba(254, 243, 199, 0.3)',
                    text: '#7c2d12',
                    textMuted: '#c2410c'
                }
            }
        };
        
        this.currentTheme = this.loadTheme();
        this.init();
    }
    
    init() {
        // Check system preference
        if (window.matchMedia && !localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    loadTheme() {
        return localStorage.getItem('theme') || 'light';
    }
    
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
    
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.saveTheme(themeName);
            this.applyTheme(themeName);
        }
    }
    
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Apply CSS variables
        Object.keys(theme.colors).forEach(key => {
            root.style.setProperty(`--color-${key}`, theme.colors[key]);
        });
        
        // Add theme class to body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);
        
        // Update gradient background
        const boardBg = document.querySelector('.board-bg');
        if (boardBg) {
            boardBg.style.background = theme.colors.background;
            boardBg.style.backgroundSize = '400% 400%';
        }
    }
    
    createThemeToggle() {
        const existingToggle = document.getElementById('themeToggle');
        if (existingToggle) return;
        
        const toggle = document.createElement('div');
        toggle.id = 'themeToggle';
        toggle.className = 'fixed bottom-4 left-4 z-50';
        toggle.innerHTML = `
            <div class="glass rounded-lg p-2">
                <button onclick="themeManager.openThemeSelector()" 
                        class="p-2 rounded-lg hover:bg-white/20 transition" 
                        title="Theme wechseln">
                    <i class="fas fa-palette text-lg"></i>
                </button>
            </div>
        `;
        document.body.appendChild(toggle);
    }
    
    openThemeSelector() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass rounded-xl p-6 max-w-md w-full animate-fade-in">
                <h3 class="text-xl font-bold mb-4">Theme auswählen</h3>
                <div class="grid grid-cols-2 gap-3">
                    ${Object.keys(this.themes).map(key => `
                        <button onclick="themeManager.setTheme('${key}'); document.querySelector('.fixed.inset-0').remove();" 
                                class="p-4 rounded-lg glass hover:scale-105 transition ${this.currentTheme === key ? 'ring-2 ring-blue-500' : ''}">
                            <div class="w-full h-20 rounded mb-2" style="background: ${this.themes[key].colors.background}; background-size: 200% 200%;"></div>
                            <span class="text-sm font-medium">${this.themes[key].name}</span>
                        </button>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="mt-4 w-full p-2 glass rounded-lg hover:bg-white/20 transition">
                    Schließen
                </button>
            </div>
        `;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
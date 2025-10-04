// Gamification System
class GamificationSystem {
    constructor(app) {
        this.app = app;
        this.userStats = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            streak: 0,
            lastActiveDate: null,
            achievements: [],
            totalTasks: 0,
            totalPoints: 0
        };
        
        this.achievements = {
            firstTask: { 
                id: 'firstTask', 
                name: 'First Step', 
                description: 'Complete your first task', 
                icon: '🎯', 
                xp: 10 
            },
            taskMaster: { 
                id: 'taskMaster', 
                name: 'Task Master', 
                description: 'Complete 50 tasks', 
                icon: '👑', 
                xp: 100 
            },
            speedDemon: { 
                id: 'speedDemon', 
                name: 'Speed Demon', 
                description: 'Complete 5 tasks in one day', 
                icon: '⚡', 
                xp: 50 
            },
            weekWarrior: { 
                id: 'weekWarrior', 
                name: 'Week Warrior', 
                description: '7 day streak', 
                icon: '🔥', 
                xp: 75 
            },
            collaborator: { 
                id: 'collaborator', 
                name: 'Team Player', 
                description: 'Comment on 10 different cards', 
                icon: '🤝', 
                xp: 30 
            },
            organizer: { 
                id: 'organizer', 
                name: 'Organizer', 
                description: 'Create 10 lists', 
                icon: '📋', 
                xp: 40 
            },
            completionist: { 
                id: 'completionist', 
                name: 'Completionist', 
                description: 'Clear an entire list', 
                icon: '✅', 
                xp: 60 
            },
            earlyBird: { 
                id: 'earlyBird', 
                name: 'Early Bird', 
                description: 'Complete a task before 9 AM', 
                icon: '🌅', 
                xp: 25 
            },
            nightOwl: { 
                id: 'nightOwl', 
                name: 'Night Owl', 
                description: 'Complete a task after 10 PM', 
                icon: '🦉', 
                xp: 25 
            }
        };
        
        this.loadStats();
        this.checkStreak();
        this.initUI();
    }
    
    initUI() {
        // Add XP bar to navigation
        this.createXPBar();
        
        // Add achievement notification container
        this.createNotificationContainer();
        
        // Add stats button
        this.createStatsButton();
    }
    
    createXPBar() {
        const nav = document.querySelector('nav');
        if (!nav || document.getElementById('xpBar')) return;
        
        const xpBar = document.createElement('div');
        xpBar.id = 'xpBar';
        xpBar.className = 'absolute bottom-0 left-0 right-0 h-1 bg-gray-200';
        xpBar.innerHTML = `
            <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                 style="width: ${(this.userStats.xp / this.userStats.xpToNextLevel) * 100}%"></div>
        `;
        nav.appendChild(xpBar);
    }
    
    createNotificationContainer() {
        if (document.getElementById('achievementNotifications')) return;
        
        const container = document.createElement('div');
        container.id = 'achievementNotifications';
        container.className = 'fixed top-20 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }
    
    createStatsButton() {
        const existingBtn = document.getElementById('statsBtn');
        if (existingBtn) return;
        
        const btn = document.createElement('button');
        btn.id = 'statsBtn';
        btn.className = 'fixed bottom-20 right-4 glass rounded-full p-3 shadow-lg hover:scale-110 transition z-40';
        btn.innerHTML = `
            <div class="relative">
                <i class="fas fa-trophy text-yellow-500 text-xl"></i>
                <span class="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    ${this.userStats.level}
                </span>
            </div>
        `;
        btn.onclick = () => this.showStats();
        document.body.appendChild(btn);
    }
    
    // Add XP and check for level up
    addXP(amount, reason) {
        this.userStats.xp += amount;
        this.userStats.totalPoints += amount;
        
        // Show XP gain animation
        this.showXPGain(amount, reason);
        
        // Check for level up
        while (this.userStats.xp >= this.userStats.xpToNextLevel) {
            this.levelUp();
        }
        
        // Update XP bar
        this.updateXPBar();
        this.saveStats();
    }
    
    levelUp() {
        this.userStats.xp -= this.userStats.xpToNextLevel;
        this.userStats.level++;
        this.userStats.xpToNextLevel = this.userStats.level * 100;
        
        // Show level up animation
        this.showLevelUp();
        
        // Update stats button
        const statsBtn = document.getElementById('statsBtn');
        if (statsBtn) {
            statsBtn.querySelector('span').textContent = this.userStats.level;
        }
    }
    
    showXPGain(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'glass rounded-lg p-3 animate-slide-in-right';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="text-2xl">✨</div>
                <div>
                    <div class="font-bold text-purple-600">+${amount} XP</div>
                    <div class="text-sm text-gray-600">${reason}</div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('achievementNotifications');
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showLevelUp() {
        // Create fullscreen celebration
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 pointer-events-none';
        celebration.innerHTML = `
            <div class="text-center animate-bounce-in">
                <div class="text-6xl mb-4">🎉</div>
                <div class="text-4xl font-bold text-purple-600 mb-2">LEVEL UP!</div>
                <div class="text-2xl">You reached level ${this.userStats.level}</div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Add confetti effect
        this.createConfetti();
        
        setTimeout(() => {
            celebration.classList.add('animate-fade-out');
            setTimeout(() => celebration.remove(), 300);
        }, 3000);
    }
    
    createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'fixed w-2 h-2 pointer-events-none z-50';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }
    }
    
    // Check and award achievements
    checkAchievement(type, data) {
        switch(type) {
            case 'taskCompleted':
                this.userStats.totalTasks++;
                
                if (this.userStats.totalTasks === 1) {
                    this.unlockAchievement('firstTask');
                }
                if (this.userStats.totalTasks === 50) {
                    this.unlockAchievement('taskMaster');
                }
                
                // Check time-based achievements
                const hour = new Date().getHours();
                if (hour < 9) {
                    this.unlockAchievement('earlyBird');
                } else if (hour >= 22) {
                    this.unlockAchievement('nightOwl');
                }
                
                // Add XP for task completion
                this.addXP(10, 'Task completed');
                break;
                
            case 'streakReached':
                if (data >= 7) {
                    this.unlockAchievement('weekWarrior');
                }
                break;
        }
        
        this.saveStats();
    }
    
    unlockAchievement(achievementId) {
        if (this.userStats.achievements.includes(achievementId)) return;
        
        const achievement = this.achievements[achievementId];
        if (!achievement) return;
        
        this.userStats.achievements.push(achievementId);
        
        // Show achievement notification
        this.showAchievement(achievement);
        
        // Add XP
        this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
    }
    
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'glass rounded-lg p-4 animate-slide-in-right shadow-xl';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-4xl">${achievement.icon}</div>
                <div>
                    <div class="font-bold text-lg">Achievement Unlocked!</div>
                    <div class="font-semibold">${achievement.name}</div>
                    <div class="text-sm text-gray-600">${achievement.description}</div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('achievementNotifications');
        container.appendChild(notification);
        
        // Play sound if available
        this.playAchievementSound();
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    playAchievementSound() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    // Streak management
    checkStreak() {
        const today = new Date().toDateString();
        const lastActive = this.userStats.lastActiveDate;
        
        if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                this.userStats.streak++;
                this.checkAchievement('streakReached', this.userStats.streak);
            } else if (diffDays > 1) {
                this.userStats.streak = 1;
            }
        } else {
            this.userStats.streak = 1;
        }
        
        this.userStats.lastActiveDate = today;
        this.saveStats();
    }
    
    // Show stats modal
    showStats() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="glass rounded-xl p-6 max-w-2xl w-full animate-fade-in">
                <h2 class="text-2xl font-bold mb-4">🏆 Your Stats</h2>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="glass rounded-lg p-4">
                        <div class="text-3xl font-bold text-purple-600">${this.userStats.level}</div>
                        <div class="text-gray-600">Level</div>
                    </div>
                    <div class="glass rounded-lg p-4">
                        <div class="text-3xl font-bold text-orange-500">${this.userStats.streak} 🔥</div>
                        <div class="text-gray-600">Day Streak</div>
                    </div>
                    <div class="glass rounded-lg p-4">
                        <div class="text-3xl font-bold text-green-500">${this.userStats.totalTasks}</div>
                        <div class="text-gray-600">Tasks Completed</div>
                    </div>
                    <div class="glass rounded-lg p-4">
                        <div class="text-3xl font-bold text-blue-500">${this.userStats.totalPoints}</div>
                        <div class="text-gray-600">Total XP</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-2">
                        <span>Level ${this.userStats.level}</span>
                        <span>${this.userStats.xp} / ${this.userStats.xpToNextLevel} XP</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                             style="width: ${(this.userStats.xp / this.userStats.xpToNextLevel) * 100}%"></div>
                    </div>
                </div>
                
                <h3 class="text-lg font-bold mb-3">Achievements</h3>
                <div class="grid grid-cols-3 gap-2 mb-4">
                    ${Object.values(this.achievements).map(achievement => `
                        <div class="glass rounded-lg p-3 text-center ${
                            this.userStats.achievements.includes(achievement.id) ? '' : 'opacity-50 grayscale'
                        }">
                            <div class="text-2xl mb-1">${achievement.icon}</div>
                            <div class="text-xs font-medium">${achievement.name}</div>
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="w-full btn-glass text-white py-2 rounded-lg">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    updateXPBar() {
        const xpBar = document.querySelector('#xpBar > div');
        if (xpBar) {
            xpBar.style.width = `${(this.userStats.xp / this.userStats.xpToNextLevel) * 100}%`;
        }
    }
    
    saveStats() {
        localStorage.setItem('gamificationStats', JSON.stringify(this.userStats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('gamificationStats');
        if (saved) {
            this.userStats = JSON.parse(saved);
        }
    }
}

// CSS for fall animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
    
    @keyframes slide-in-right {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes bounce-in {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-out;
    }
    
    .animate-bounce-in {
        animation: bounce-in 0.5s ease-out;
    }
`;
document.head.appendChild(style);
// Analytics Dashboard
class AnalyticsDashboard {
    constructor(app) {
        this.app = app;
        this.metrics = {
            cardsCreated: 0,
            cardsMoved: 0,
            cardsCompleted: 0,
            averageTimeInColumn: {},
            velocity: [],
            burndownData: []
        };
    }
    
    show() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto';
        modal.innerHTML = `
            <div class="glass rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">📊 Analytics Dashboard</h2>
                    <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-white/20 rounded-lg transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Metrics Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    ${this.renderMetricCards()}
                </div>
                
                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Burndown Chart -->
                    <div class="glass rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-3">📉 Burndown Chart</h3>
                        <canvas id="burndownChart" width="400" height="200"></canvas>
                    </div>
                    
                    <!-- Velocity Chart -->
                    <div class="glass rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-3">📈 Team Velocity</h3>
                        <canvas id="velocityChart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <!-- Activity Heatmap -->
                <div class="glass rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-semibold mb-3">🔥 Activity Heatmap</h3>
                    <div id="activityHeatmap" class="grid grid-cols-7 gap-1">
                        ${this.renderHeatmap()}
                    </div>
                </div>
                
                <!-- Column Metrics -->
                <div class="glass rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">⏱️ Time in Column</h3>
                    <div class="space-y-2">
                        ${this.renderColumnMetrics()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Initialize charts
        setTimeout(() => {
            this.initCharts();
        }, 100);
    }
    
    renderMetricCards() {
        const metrics = [
            { 
                title: 'Tasks Completed', 
                value: Math.floor(Math.random() * 50) + 20,
                icon: 'fa-check-circle',
                color: 'bg-green-500',
                trend: '+12%'
            },
            { 
                title: 'In Progress', 
                value: Math.floor(Math.random() * 15) + 5,
                icon: 'fa-spinner',
                color: 'bg-blue-500',
                trend: '-3%'
            },
            { 
                title: 'Avg. Cycle Time', 
                value: '3.2 days',
                icon: 'fa-clock',
                color: 'bg-purple-500',
                trend: '-0.5 days'
            },
            { 
                title: 'Team Velocity', 
                value: Math.floor(Math.random() * 30) + 15,
                icon: 'fa-tachometer-alt',
                color: 'bg-orange-500',
                trend: '+8%'
            }
        ];
        
        return metrics.map(metric => `
            <div class="glass rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="${metric.color} p-2 rounded-lg text-white">
                        <i class="fas ${metric.icon}"></i>
                    </div>
                    <span class="text-xs ${metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}">
                        ${metric.trend}
                    </span>
                </div>
                <div class="text-2xl font-bold">${metric.value}</div>
                <div class="text-sm text-gray-600">${metric.title}</div>
            </div>
        `).join('');
    }
    
    renderHeatmap() {
        const weeks = 12;
        const days = 7;
        let html = '';
        
        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < days; day++) {
                const intensity = Math.random();
                const color = intensity === 0 ? 'bg-gray-200' :
                            intensity < 0.25 ? 'bg-green-200' :
                            intensity < 0.5 ? 'bg-green-300' :
                            intensity < 0.75 ? 'bg-green-400' :
                            'bg-green-500';
                
                html += `<div class="${color} w-4 h-4 rounded-sm" title="Activity"></div>`;
            }
        }
        
        return html;
    }
    
    renderColumnMetrics() {
        const columns = ['To Do', 'In Progress', 'Review', 'Done'];
        
        return columns.map(column => {
            const avgTime = (Math.random() * 5 + 1).toFixed(1);
            const cards = Math.floor(Math.random() * 10) + 1;
            
            return `
                <div class="flex justify-between items-center p-3 glass rounded-lg">
                    <div>
                        <div class="font-semibold">${column}</div>
                        <div class="text-sm text-gray-600">${cards} cards</div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold">${avgTime} days</div>
                        <div class="text-xs text-gray-600">avg. time</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    initCharts() {
        // Initialize burndown chart
        const burndownCtx = document.getElementById('burndownChart');
        if (burndownCtx) {
            this.drawBurndownChart(burndownCtx);
        }
        
        // Initialize velocity chart
        const velocityCtx = document.getElementById('velocityChart');
        if (velocityCtx) {
            this.drawVelocityChart(velocityCtx);
        }
    }
    
    drawBurndownChart(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, height - 30);
        ctx.lineTo(width - 20, height - 30);
        ctx.stroke();
        
        // Draw ideal line
        ctx.strokeStyle = '#9ca3af';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(width - 20, height - 30);
        ctx.stroke();
        
        // Draw actual line
        ctx.strokeStyle = '#6366f1';
        ctx.setLineDash([]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const points = this.generateBurndownData();
        points.forEach((point, index) => {
            const x = 40 + (index * (width - 60) / (points.length - 1));
            const y = 20 + (point * (height - 50) / 100);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw point
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.stroke();
    }
    
    drawVelocityChart(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Generate velocity data
        const sprints = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'];
        const velocities = sprints.map(() => Math.floor(Math.random() * 30) + 10);
        
        const barWidth = (width - 80) / sprints.length;
        const maxVelocity = Math.max(...velocities);
        
        velocities.forEach((velocity, index) => {
            const x = 40 + (index * barWidth) + barWidth * 0.2;
            const barHeight = (velocity / maxVelocity) * (height - 60);
            const y = height - 30 - barHeight;
            
            // Draw bar
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(x, y, barWidth * 0.6, barHeight);
            
            // Draw value
            ctx.fillStyle = '#1f2937';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(velocity, x + barWidth * 0.3, y - 5);
        });
    }
    
    generateBurndownData() {
        const points = [];
        let current = 100;
        
        for (let i = 0; i < 10; i++) {
            current -= Math.random() * 15 + 5;
            if (current < 0) current = 0;
            points.push(current);
        }
        
        return points;
    }
    
    // Track metrics
    trackCardCreated() {
        this.metrics.cardsCreated++;
        this.saveMetrics();
    }
    
    trackCardMoved(fromList, toList) {
        this.metrics.cardsMoved++;
        if (toList === 'Done') {
            this.metrics.cardsCompleted++;
        }
        this.saveMetrics();
    }
    
    trackEvent(action, data = {}) {
        // Generic event tracking
        switch(action) {
            case 'card_created':
                this.trackCardCreated();
                break;
            case 'card_moved':
                this.trackCardMoved(data.fromList, data.toList);
                break;
            default:
                console.log('Analytics event:', action, data);
        }
    }
    
    saveMetrics() {
        localStorage.setItem('analyticsMetrics', JSON.stringify(this.metrics));
    }
    
    loadMetrics() {
        const saved = localStorage.getItem('analyticsMetrics');
        if (saved) {
            this.metrics = JSON.parse(saved);
        }
    }
}
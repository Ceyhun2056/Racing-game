// 2D Racing Game in JavaScript using Canvas
// Clean, beginner-friendly, and easy to extend

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDiv = document.getElementById('score');
const gameOverDiv = document.getElementById('game-over');
const restartBtn = document.getElementById('restartBtn');
const menuDiv = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const menuBtn = document.getElementById('menuBtn');

const WIDTH = 400;
const HEIGHT = 600;
const LANES = 4;
const LANE_WIDTH = WIDTH / LANES;
const BORDER_WIDTH = 30;

// Car sizes
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 70;
const OPPONENT_WIDTH = 40;
const OPPONENT_HEIGHT = 70;

// Game state - Initialize all variables properly
let player, opponentCars, powerUps, particles;
let left = false, right = false, up = false, down = false;
let running = false, gameOver = false, inMenu = true;
let score = 0, roadOffset = 0, frameCount = 0;
let lives = 3;
let level = 1;
let baseSpeed = 5;
let highScore = localStorage.getItem('racingHighScore') || 0;

// Power-up types
const POWER_UP_TYPES = {
    COIN: { color: '#ffd700', points: 50 },
    SHIELD: { color: '#00bcd4', duration: 300 },
    SPEED: { color: '#ff5722', duration: 180 }
};

const CAR_COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#ff9800', '#00bcd4', '#ff00cc'];
const PLAYER_COLOR = '#ffd600';

// Car sprites cache
let carSprites = {};

// Color utility functions
function lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `rgb(${r}, ${g}, ${b})`;
}

// Create car sprite (PNG-like image)
function createCarSprite(color, width, height, isPlayer = false) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width + 10; // Extra padding for effects
    spriteCanvas.height = height + 10;
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Add roundRect method if not available
    if (!spriteCtx.roundRect) {
        spriteCtx.roundRect = function(x, y, w, h, r) {
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
        };
    }
    
    spriteCtx.save();
    spriteCtx.translate(spriteCanvas.width / 2, spriteCanvas.height / 2);
    spriteCtx.rotate(isPlayer ? -Math.PI / 2 : Math.PI / 2);
    
    // Car body with metallic gradient
    let bodyGrad = spriteCtx.createLinearGradient(0, -width/2, 0, width/2);
    bodyGrad.addColorStop(0, lightenColor(color, 40));
    bodyGrad.addColorStop(0.2, lightenColor(color, 20));
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(0.8, darkenColor(color, 15));
    bodyGrad.addColorStop(1, darkenColor(color, 30));
    
    spriteCtx.fillStyle = bodyGrad;
    spriteCtx.strokeStyle = darkenColor(color, 40);
    spriteCtx.lineWidth = 2;
    
    // Car body shape
    spriteCtx.roundRect(-height/2 + 8, -width/2 + 6, height - 16, width - 12, 6);
    spriteCtx.fill();
    spriteCtx.stroke();
    
    // Windows with realistic glass effect
    let windowGrad = spriteCtx.createLinearGradient(0, -12, 0, 12);
    windowGrad.addColorStop(0, '#b3d9ff');
    windowGrad.addColorStop(0.3, '#7db8e8');
    windowGrad.addColorStop(0.7, '#4a90c2');
    windowGrad.addColorStop(1, '#2c5d8a');
    spriteCtx.fillStyle = windowGrad;
    spriteCtx.fillRect(-12, -12, 24, 24);
    
    // Window frame
    spriteCtx.strokeStyle = '#1a1a1a';
    spriteCtx.lineWidth = 1.5;
    spriteCtx.strokeRect(-12, -12, 24, 24);
    
    // Wheels with chrome effect
    let wheelGrad = spriteCtx.createRadialGradient(0, 0, 1, 0, 0, 5);
    wheelGrad.addColorStop(0, '#888');
    wheelGrad.addColorStop(0.6, '#333');
    wheelGrad.addColorStop(0.8, '#111');
    wheelGrad.addColorStop(1, '#000');
    
    spriteCtx.fillStyle = wheelGrad;
    // Four wheels
    spriteCtx.beginPath();
    spriteCtx.arc(-height/2 + 10, -width/2 + 10, 5, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.beginPath();
    spriteCtx.arc(height/2 - 10, -width/2 + 10, 5, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.beginPath();
    spriteCtx.arc(-height/2 + 10, width/2 - 10, 5, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.beginPath();
    spriteCtx.arc(height/2 - 10, width/2 - 10, 5, 0, Math.PI * 2);
    spriteCtx.fill();
    
    // Wheel rims
    spriteCtx.strokeStyle = '#555';
    spriteCtx.lineWidth = 1;
    spriteCtx.beginPath();
    spriteCtx.arc(-height/2 + 10, -width/2 + 10, 3, 0, Math.PI * 2);
    spriteCtx.stroke();
    spriteCtx.beginPath();
    spriteCtx.arc(height/2 - 10, -width/2 + 10, 3, 0, Math.PI * 2);
    spriteCtx.stroke();
    spriteCtx.beginPath();
    spriteCtx.arc(-height/2 + 10, width/2 - 10, 3, 0, Math.PI * 2);
    spriteCtx.stroke();
    spriteCtx.beginPath();
    spriteCtx.arc(height/2 - 10, width/2 - 10, 3, 0, Math.PI * 2);
    spriteCtx.stroke();
    
    // Lights
    if (isPlayer) {
        // Headlights
        spriteCtx.fillStyle = '#ffffaa';
        spriteCtx.shadowColor = '#ffffaa';
        spriteCtx.shadowBlur = 6;
        spriteCtx.beginPath();
        spriteCtx.arc(height/2 - 6, -8, 2.5, 0, Math.PI * 2);
        spriteCtx.fill();
        spriteCtx.beginPath();
        spriteCtx.arc(height/2 - 6, 8, 2.5, 0, Math.PI * 2);
        spriteCtx.fill();
    } else {
        // Taillights
        spriteCtx.fillStyle = '#ff4444';
        spriteCtx.shadowColor = '#ff4444';
        spriteCtx.shadowBlur = 6;
        spriteCtx.beginPath();
        spriteCtx.arc(height/2 - 6, -8, 2.5, 0, Math.PI * 2);
        spriteCtx.fill();
        spriteCtx.beginPath();
        spriteCtx.arc(height/2 - 6, 8, 2.5, 0, Math.PI * 2);
        spriteCtx.fill();
    }
    
    // Car highlight for metallic effect
    spriteCtx.shadowBlur = 0;
    spriteCtx.globalAlpha = 0.4;
    spriteCtx.fillStyle = '#fff';
    spriteCtx.beginPath();
    spriteCtx.ellipse(-8, -10, 12, 4, 0, 0, Math.PI * 2);
    spriteCtx.fill();
    
    spriteCtx.restore();
    return spriteCanvas;
}

// Initialize car sprites
function initCarSprites() {
    // Create player sprite
    carSprites['player'] = createCarSprite(PLAYER_COLOR, PLAYER_WIDTH, PLAYER_HEIGHT, true);
    
    // Create opponent sprites for each color
    CAR_COLORS.forEach(color => {
        carSprites[color] = createCarSprite(color, OPPONENT_WIDTH, OPPONENT_HEIGHT, false);
    });
}

// Audio context for sound effects
let audioCtx;
try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.log('Audio not supported');
}

// Sound effect functions
function playSound(frequency, duration, type = 'sine') {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

// Enhanced particle system
function createParticle(x, y, color, velX = 0, velY = 0, life = 30, size = 3) {
    return { 
        x, y, color, velX, velY, life, maxLife: life, size,
        gravity: 0.1, fade: 1, rotation: Math.random() * Math.PI * 2
    };
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velX;
        p.y += p.velY;
        p.velY += p.gravity; // Add gravity effect
        p.life--;
        p.fade = p.life / p.maxLife; // Smooth fading
        p.rotation += 0.1; // Rotate particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.fade;
        ctx.translate(p.x + p.size/2, p.y + p.size/2);
        ctx.rotate(p.rotation);
        
        // Create gradient for particle
        let particleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        particleGrad.addColorStop(0, p.color);
        particleGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = particleGrad;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// Power-up functions
function spawnPowerUp() {
    if (Math.random() < 0.3) { // 30% chance
        const lane = Math.floor(Math.random() * LANES);
        const x = BORDER_WIDTH + lane * LANE_WIDTH + (LANE_WIDTH - 20) / 2;
        const types = Object.keys(POWER_UP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        powerUps.push({
            x: x,
            y: -20,
            width: 20,
            height: 20,
            type: type,
            collected: false
        });
    }
}

function drawPowerUp(powerUp) {
    ctx.save();
    const config = POWER_UP_TYPES[powerUp.type];
    
    // Outer glow effect
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 20;
    
    // Main power-up body with gradient
    let powerUpGrad = ctx.createRadialGradient(powerUp.x + 10, powerUp.y + 10, 2, powerUp.x + 10, powerUp.y + 10, 12);
    powerUpGrad.addColorStop(0, lightenColor(config.color, 50));
    powerUpGrad.addColorStop(0.5, config.color);
    powerUpGrad.addColorStop(1, darkenColor(config.color, 30));
    
    ctx.fillStyle = powerUpGrad;
    ctx.beginPath();
    ctx.arc(powerUp.x + 10, powerUp.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Rotating inner design based on type
    ctx.save();
    ctx.translate(powerUp.x + 10, powerUp.y + 10);
    ctx.rotate(frameCount * 0.1);
    
    if (powerUp.type === 'COIN') {
        // Coin design with $ symbol
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
    } else if (powerUp.type === 'SHIELD') {
        // Shield design
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, -2);
        ctx.lineTo(-4, 4);
        ctx.lineTo(0, 6);
        ctx.lineTo(4, 4);
        ctx.lineTo(4, -2);
        ctx.closePath();
        ctx.stroke();
    } else if (powerUp.type === 'SPEED') {
        // Lightning bolt design
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(2, -2);
        ctx.lineTo(-1, 0);
        ctx.lineTo(3, 6);
        ctx.lineTo(-1, 2);
        ctx.lineTo(1, 0);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    
    // Pulsing outer ring
    const pulse = Math.sin(frameCount * 0.15) * 3;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(powerUp.x + 10, powerUp.y + 10, 12 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    
    // Sparkle effects
    for (let i = 0; i < 4; i++) {
        const angle = (frameCount * 0.05 + i * Math.PI / 2);
        const sparkleX = powerUp.x + 10 + Math.cos(angle) * (15 + pulse);
        const sparkleY = powerUp.y + 10 + Math.sin(angle) * (15 + pulse);
        
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawSky() {
    // Animated sky gradient
    let skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    const timeOfDay = (frameCount * 0.01) % (Math.PI * 2);
    const skyR = 100 + Math.sin(timeOfDay) * 50;
    const skyG = 150 + Math.sin(timeOfDay + 1) * 40;
    const skyB = 200 + Math.sin(timeOfDay + 2) * 30;
    
    skyGrad.addColorStop(0, `rgb(${skyR}, ${skyG}, ${skyB})`);
    skyGrad.addColorStop(1, `rgb(${skyR - 30}, ${skyG - 20}, ${skyB - 10})`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Animated clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 5; i++) {
        const cloudX = (frameCount * 0.5 + i * 100) % (WIDTH + 60) - 30;
        const cloudY = 50 + Math.sin(frameCount * 0.02 + i) * 20;
        
        // Draw cloud shape
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 15, 0, Math.PI * 2);
        ctx.arc(cloudX + 20, cloudY, 20, 0, Math.PI * 2);
        ctx.arc(cloudX + 40, cloudY, 15, 0, Math.PI * 2);
        ctx.arc(cloudX + 20, cloudY - 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRoad() {
    // Enhanced grass borders with multiple gradients
    let grassGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grassGrad.addColorStop(0, '#8BC34A');
    grassGrad.addColorStop(0.3, '#689F38');
    grassGrad.addColorStop(0.7, '#558B2F');
    grassGrad.addColorStop(1, '#33691E');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, BORDER_WIDTH, HEIGHT);
    ctx.fillRect(WIDTH - BORDER_WIDTH, 0, BORDER_WIDTH, HEIGHT);
    
    // Enhanced trees with variety
    for (let y = 30; y < HEIGHT; y += 80) {
        // Left side trees
        let treeSize = 12 + Math.sin(y * 0.1) * 4;
        let treeGrad = ctx.createRadialGradient(BORDER_WIDTH / 2, y, 3, BORDER_WIDTH / 2, y, treeSize);
        treeGrad.addColorStop(0, '#66BB6A');
        treeGrad.addColorStop(0.5, '#4CAF50');
        treeGrad.addColorStop(1, '#2E7D32');
        ctx.beginPath();
        ctx.arc(BORDER_WIDTH / 2, y, treeSize, 0, Math.PI * 2);
        ctx.fillStyle = treeGrad;
        ctx.fill();
        
        // Tree trunk
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(BORDER_WIDTH / 2 - 2, y + treeSize - 2, 4, 8);
        
        // Right side trees (offset)
        let rightTreeSize = 10 + Math.sin((y + 40) * 0.1) * 3;
        let rightTreeGrad = ctx.createRadialGradient(WIDTH - BORDER_WIDTH / 2, y + 40, 3, WIDTH - BORDER_WIDTH / 2, y + 40, rightTreeSize);
        rightTreeGrad.addColorStop(0, '#66BB6A');
        rightTreeGrad.addColorStop(0.5, '#4CAF50');
        rightTreeGrad.addColorStop(1, '#2E7D32');
        ctx.beginPath();
        ctx.arc(WIDTH - BORDER_WIDTH / 2, y + 40, rightTreeSize, 0, Math.PI * 2);
        ctx.fillStyle = rightTreeGrad;
        ctx.fill();
        
        // Right tree trunk
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(WIDTH - BORDER_WIDTH / 2 - 2, y + 40 + rightTreeSize - 2, 4, 8);
    }
    
    // Enhanced road with realistic asphalt texture
    let roadGrad = ctx.createLinearGradient(BORDER_WIDTH, 0, WIDTH - BORDER_WIDTH, 0);
    roadGrad.addColorStop(0, '#3E3E3E');
    roadGrad.addColorStop(0.1, '#2C2C2C');
    roadGrad.addColorStop(0.5, '#1A1A1A');
    roadGrad.addColorStop(0.9, '#2C2C2C');
    roadGrad.addColorStop(1, '#3E3E3E');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(BORDER_WIDTH, 0, WIDTH - 2 * BORDER_WIDTH, HEIGHT);
    
    // Road edges with highlights
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(BORDER_WIDTH, 0);
    ctx.lineTo(BORDER_WIDTH, HEIGHT);
    ctx.moveTo(WIDTH - BORDER_WIDTH, 0);
    ctx.lineTo(WIDTH - BORDER_WIDTH, HEIGHT);
    ctx.stroke();
    
    // Enhanced lane dividers with glow effect
    ctx.save();
    ctx.shadowColor = '#FFEB3B';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#FFEB3B';
    ctx.lineWidth = 3;
    for (let i = 1; i < LANES; i++) {
        for (let y = -30 + (roadOffset % 50); y < HEIGHT; y += 50) {
            ctx.beginPath();
            ctx.moveTo(BORDER_WIDTH + i * LANE_WIDTH, y);
            ctx.lineTo(BORDER_WIDTH + i * LANE_WIDTH, y + 25);
            ctx.stroke();
        }
    }
    
    // Enhanced lane boundary markers with clearer road edges
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 2;
    ctx.shadowColor = '#333';
    for (let i = 0; i <= LANES; i++) {
        const x = BORDER_WIDTH + i * LANE_WIDTH;
        if (i === 0 || i === LANES) {
            // Road edges - very prominent to show car boundaries
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#FFF';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#FFF';
            
            // Draw solid road edge lines
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, HEIGHT);
            ctx.stroke();
            
            // Add reflective road edge markings
            ctx.strokeStyle = '#FFEB3B';
            ctx.lineWidth = 2;
            for (let y = -10 + (roadOffset % 40); y < HEIGHT; y += 40) {
                ctx.beginPath();
                ctx.moveTo(x - 2, y);
                ctx.lineTo(x - 2, y + 20);
                ctx.stroke();
            }
        } else {
            // Inner lane guides - subtle
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#555';
            ctx.shadowBlur = 1;
            for (let y = -10 + (roadOffset % 30); y < HEIGHT; y += 30) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 15);
                ctx.stroke();
            }
        }
    }
    
    // Add warning strips at road edges (like real highways)
    ctx.fillStyle = '#FF6B00';
    for (let y = -20 + (roadOffset % 60); y < HEIGHT; y += 60) {
        // Left edge warning strip
        ctx.fillRect(BORDER_WIDTH - 3, y, 6, 30);
        // Right edge warning strip  
        ctx.fillRect(WIDTH - BORDER_WIDTH - 3, y, 6, 30);
    }
    
    ctx.restore();
    
    // Road surface details (small rocks/texture) - more stable pattern
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 15; i++) {
        // Use deterministic positions based on i to reduce randomness
        let x = BORDER_WIDTH + (i * 37 + 50) % (WIDTH - 2 * BORDER_WIDTH);
        let y = ((i * 73 + frameCount * 1.5) % HEIGHT);
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCar(x, y, color) {
    ctx.save();
    
    // Draw shadow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + PLAYER_WIDTH/2 + 2, y + PLAYER_HEIGHT + 8, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Draw car sprite
    if (carSprites['player']) {
        ctx.drawImage(carSprites['player'], x - 5, y - 5);
    }
    
    ctx.restore();
}

function drawOpponentCar(x, y, color) {
    ctx.save();
    
    // Draw shadow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + OPPONENT_WIDTH/2 + 2, y + OPPONENT_HEIGHT + 8, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Draw car sprite
    if (carSprites[color]) {
        ctx.drawImage(carSprites[color], x - 5, y - 5);
    }
    
    ctx.restore();
}

function resetGame() {
    // Initialize car sprites
    initCarSprites();
    
    // Place player in the center lanes
    const playerLane = Math.floor(LANES / 2);
    const laneStart = BORDER_WIDTH + playerLane * LANE_WIDTH;
    const carPadding = 5;
    player = {
        lane: playerLane,
        x: laneStart + carPadding + (LANE_WIDTH - PLAYER_WIDTH - 2 * carPadding) / 2,
        y: HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: 5,
        color: PLAYER_COLOR,
        shielded: false,
        shieldTime: 0,
        speedBoost: false,
        speedBoostTime: 0
    };
    opponentCars = [];
    powerUps = [];
    particles = [];
    left = right = up = down = false;
    running = true;
    gameOver = false;
    score = 0;
    lives = 3;
    level = 1;
    baseSpeed = 5;
    roadOffset = 0;
    frameCount = 0;
    gameOverDiv.classList.add('hidden');
    updateScoreDisplay();
    window.requestAnimationFrame(gameLoop);
}

function updateScoreDisplay() {
    scoreDiv.innerHTML = `
        Score: ${score} | Lives: ${lives} | Level: ${level}<br>
        High Score: ${highScore} | Speed: ${Math.round(baseSpeed)}
    `;
}

function showMenu() {
    inMenu = true;
    document.getElementById('game-container').classList.add('hidden');
    menuDiv.classList.remove('hidden');
}

function startGame() {
    inMenu = false;
    menuDiv.classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    resetGame();
}

function spawnOpponentCar() {
    // Pick a random lane and ensure it's within valid range
    const lane = Math.max(0, Math.min(LANES - 1, Math.floor(Math.random() * LANES)));
    
    // Check if there's already a car too close in this lane
    const minSpacing = 150; // Minimum distance between cars
    for (let car of opponentCars) {
        if (car.lane === lane && car.y > -minSpacing && car.y < minSpacing) {
            return; // Don't spawn if there's a car too close
        }
    }
    
    // Calculate lane boundaries with strict validation
    const laneStart = BORDER_WIDTH + lane * LANE_WIDTH;
    const laneEnd = BORDER_WIDTH + (lane + 1) * LANE_WIDTH;
    const carPadding = 5; // Padding from lane edges
    
    // Calculate x position with multiple validations
    let x = laneStart + carPadding + (LANE_WIDTH - OPPONENT_WIDTH - 2 * carPadding) / 2;
    
    // Double-check that car stays within road boundaries
    const roadStart = BORDER_WIDTH;
    const roadEnd = WIDTH - BORDER_WIDTH;
    
    // Ensure x position is within road bounds
    if (x < roadStart) {
        x = roadStart;
    } else if (x + OPPONENT_WIDTH > roadEnd) {
        x = roadEnd - OPPONENT_WIDTH;
    }
    
    // Final validation - ensure car is within the designated lane
    if (x < laneStart + carPadding) {
        x = laneStart + carPadding;
    } else if (x + OPPONENT_WIDTH > laneEnd - carPadding) {
        x = laneEnd - carPadding - OPPONENT_WIDTH;
    }
    
    // Progressive difficulty - speed increases with level
    const minSpeed = 2 + (level - 1) * 0.5;
    const maxSpeed = 4 + (level - 1) * 0.7;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    // Pick a random color
    const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
    opponentCars.push({
        lane: lane,
        x: x,
        y: -OPPONENT_HEIGHT,
        width: OPPONENT_WIDTH,
        height: OPPONENT_HEIGHT,
        speed: speed,
        color: color
    });
}

function checkCollision(a, b) {
    // More precise collision detection with smaller hitboxes
    const margin = 5;
    return (
        a.x + margin < b.x + b.width - margin &&
        a.x + a.width - margin > b.x + margin &&
        a.y + margin < b.y + b.height - margin &&
        a.y + a.height - margin > b.y + margin
    );
}

function handleCollision() {
    if (player.shielded) {
        playSound(440, 0.2, 'square'); // Shield sound
        return;
    }
    
    lives--;
    playSound(220, 0.5, 'sawtooth'); // Collision sound
    
    // Create enhanced explosion particles
    const explosionColors = ['#ff4444', '#ff8800', '#ffff00', '#ff6600'];
    for (let i = 0; i < 25; i++) {
        const color = explosionColors[Math.floor(Math.random() * explosionColors.length)];
        const angle = (Math.PI * 2 * i) / 25;
        const speed = 3 + Math.random() * 8;
        particles.push(createParticle(
            player.x + PLAYER_WIDTH / 2,
            player.y + PLAYER_HEIGHT / 2,
            color,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            40 + Math.random() * 20,
            2 + Math.random() * 4
        ));
    }
    
    // Add sparks
    for (let i = 0; i < 15; i++) {
        particles.push(createParticle(
            player.x + PLAYER_WIDTH / 2 + (Math.random() - 0.5) * 30,
            player.y + PLAYER_HEIGHT / 2 + (Math.random() - 0.5) * 30,
            '#fff',
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12,
            20 + Math.random() * 10,
            1
        ));
    }
    
    if (lives <= 0) {
        running = false;
        gameOver = true;
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('racingHighScore', highScore);
        }
        
        gameOverDiv.classList.remove('hidden');
    } else {
        // Temporary invincibility
        player.shielded = true;
        player.shieldTime = 120;
    }
}

function gameLoop() {
    if (!running) return;
    
    // Update player effects
    if (player.shieldTime > 0) {
        player.shieldTime--;
        if (player.shieldTime <= 0) player.shielded = false;
    }
    if (player.speedBoostTime > 0) {
        player.speedBoostTime--;
        if (player.speedBoostTime <= 0) player.speedBoost = false;
    }
    
    // Lane-based movement
    if (left && player.lane > 0) {
        player.lane--;
        left = false;
        playSound(800, 0.1, 'square'); // Lane change sound
    }
    if (right && player.lane < LANES - 1) {
        player.lane++;
        right = false;
        playSound(800, 0.1, 'square'); // Lane change sound
    }
    player.x = BORDER_WIDTH + player.lane * LANE_WIDTH + (LANE_WIDTH - PLAYER_WIDTH) / 2;
    
    // Speed control
    let speedFactor = 1.0;
    if (up) speedFactor = player.speedBoost ? 2.0 : 1.5;
    if (down) speedFactor = 0.6;
    
    // Update road animation
    roadOffset += baseSpeed * speedFactor;
    if (roadOffset >= HEIGHT) roadOffset = 0;
    
    // Progressive difficulty
    level = Math.floor(score / 500) + 1;
    baseSpeed = 5 + (level - 1) * 0.3;
    
    // Move opponent cars
    for (let i = opponentCars.length - 1; i >= 0; i--) {
        const car = opponentCars[i];
        car.y += car.speed * speedFactor;
        
        // Ensure cars stay within their lane boundaries
        const laneStart = BORDER_WIDTH + car.lane * LANE_WIDTH;
        const laneEnd = BORDER_WIDTH + (car.lane + 1) * LANE_WIDTH;
        const carPadding = 5;
        
        // Calculate proper lane center position
        const laneCenterX = laneStart + carPadding + (LANE_WIDTH - OPPONENT_WIDTH - 2 * carPadding) / 2;
        
        // Enforce lane boundaries - snap car back to lane center if it drifts
        if (car.x < laneStart + carPadding) {
            car.x = laneStart + carPadding;
        } else if (car.x + OPPONENT_WIDTH > laneEnd - carPadding) {
            car.x = laneEnd - carPadding - OPPONENT_WIDTH;
        }
        
        // Keep cars perfectly centered in their lanes - no drift for stability
        car.x = laneCenterX;
        
        // Ensure cars never go beyond road boundaries (final safety check)
        const roadStart = BORDER_WIDTH;
        const roadEnd = WIDTH - BORDER_WIDTH;
        if (car.x < roadStart) {
            car.x = roadStart;
        } else if (car.x + OPPONENT_WIDTH > roadEnd) {
            car.x = roadEnd - OPPONENT_WIDTH;
        }
        
        if (car.y > HEIGHT) {
            opponentCars.splice(i, 1);
            score += 10; // Points for avoiding cars
        }
    }
    
    // Move power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += baseSpeed * speedFactor;
        if (powerUps[i].y > HEIGHT) {
            powerUps.splice(i, 1);
        }
    }
    
    // Spawn new opponent cars (increased frequency with level)
    frameCount++;
    const spawnRate = Math.max(30, 60 - level * 2);
    if (frameCount % spawnRate === 0) {
        spawnOpponentCar();
    }
    
    // Spawn power-ups occasionally
    if (frameCount % 200 === 0) {
        spawnPowerUp();
    }
    
    // Check collisions with opponents
    for (let car of opponentCars) {
        if (checkCollision(player, car)) {
            handleCollision();
            break;
        }
    }
    
    // Check power-up collection
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (checkCollision(player, powerUp)) {
            const config = POWER_UP_TYPES[powerUp.type];
            
            if (powerUp.type === 'COIN') {
                score += config.points;
                playSound(880, 0.2, 'sine'); // Coin sound
            } else if (powerUp.type === 'SHIELD') {
                player.shielded = true;
                player.shieldTime = config.duration;
                playSound(660, 0.3, 'triangle'); // Shield sound
            } else if (powerUp.type === 'SPEED') {
                player.speedBoost = true;
                player.speedBoostTime = config.duration;
                playSound(1100, 0.3, 'sawtooth'); // Speed boost sound
            }
            
            // Create enhanced collection particles
            for (let j = 0; j < 12; j++) {
                const angle = (Math.PI * 2 * j) / 12;
                const speed = 2 + Math.random() * 4;
                particles.push(createParticle(
                    powerUp.x + 10,
                    powerUp.y + 10,
                    config.color,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    25 + Math.random() * 15,
                    2 + Math.random() * 2
                ));
            }
            
            // Add sparkle particles
            for (let j = 0; j < 6; j++) {
                particles.push(createParticle(
                    powerUp.x + 10 + (Math.random() - 0.5) * 20,
                    powerUp.y + 10 + (Math.random() - 0.5) * 20,
                    '#fff',
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    15,
                    1
                ));
            }
            
            powerUps.splice(i, 1);
        }
    }
    
    // Add enhanced exhaust particles
    if (frameCount % 2 === 0) {
        const exhaustColor = player.speedBoost ? '#ff8800' : '#666';
        particles.push(createParticle(
            player.x + PLAYER_WIDTH / 2 + (Math.random() - 0.5) * 15,
            player.y + PLAYER_HEIGHT,
            exhaustColor,
            (Math.random() - 0.5) * 3,
            3 + Math.random() * 4,
            20 + Math.random() * 10,
            3 + Math.random() * 2
        ));
        
        // Add second exhaust trail
        particles.push(createParticle(
            player.x + PLAYER_WIDTH / 2 + (Math.random() - 0.5) * 15,
            player.y + PLAYER_HEIGHT + 5,
            player.speedBoost ? '#ff4400' : '#444',
            (Math.random() - 0.5) * 2,
            2 + Math.random() * 3,
            15 + Math.random() * 8,
            2 + Math.random()
        ));
    }
    
    // Update particles
    updateParticles();
    
    // Update score
    if (running) score += Math.floor(speedFactor);
    updateScoreDisplay();
    
    // Render
    drawSky();
    drawRoad();
    drawCar(player.x, player.y, player.color);
    
    // Draw shield effect
    if (player.shielded) {
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(frameCount * 0.3);
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00bcd4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw speed boost effect
    if (player.speedBoost) {
        ctx.save();
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(frameCount * 0.4);
        ctx.strokeStyle = '#ff5722';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff5722';
        ctx.shadowBlur = 15;
        
        // Draw multiple rings for speed effect
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, 35 + i * 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    
    for (let car of opponentCars) {
        drawOpponentCar(car.x, car.y, car.color);
    }
    
    for (let powerUp of powerUps) {
        drawPowerUp(powerUp);
    }
    
    drawParticles();
    
    if (running) window.requestAnimationFrame(gameLoop);
}

// Keyboard controls
window.addEventListener('keydown', function(e) {
    if (e.code === 'ArrowLeft') left = true;
    if (e.code === 'ArrowRight') right = true;
    if (e.code === 'ArrowUp') up = true;
    if (e.code === 'ArrowDown') down = true;
});
window.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowLeft') left = false;
    if (e.code === 'ArrowRight') right = false;
    if (e.code === 'ArrowUp') up = false;
    if (e.code === 'ArrowDown') down = false;
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    restartBtn.addEventListener('click', resetGame);
    startBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', showMenu);
    
    // Start in menu
    showMenu();
});

// Only start game when user clicks start

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

// Game state
let player, opponentCars, powerUps, particles, left, right, up, down, running, gameOver, score, roadOffset, frameCount, inMenu = true;
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

// Particle system
function createParticle(x, y, color, velX = 0, velY = 0, life = 30) {
    return { x, y, color, velX, velY, life, maxLife: life };
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velX;
        p.y += p.velY;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
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
    ctx.fillStyle = config.color;
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(powerUp.x + 10, powerUp.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    // Add pulsing effect
    const pulse = Math.sin(frameCount * 0.1) * 2;
    ctx.beginPath();
    ctx.arc(powerUp.x + 10, powerUp.y + 10, 8 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}


function drawRoad() {
    // Grass borders with gradient
    let grassGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grassGrad.addColorStop(0, '#d4fc79');
    grassGrad.addColorStop(1, '#96e6a1');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, BORDER_WIDTH, HEIGHT);
    ctx.fillRect(WIDTH - BORDER_WIDTH, 0, BORDER_WIDTH, HEIGHT);
    // Trees (shaded circles)
    for (let y = 30; y < HEIGHT; y += 70) {
        let grad = ctx.createRadialGradient(BORDER_WIDTH / 2, y, 6, BORDER_WIDTH / 2, y, 14);
        grad.addColorStop(0, '#43a047');
        grad.addColorStop(1, '#1b5e20');
        ctx.beginPath();
        ctx.arc(BORDER_WIDTH / 2, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        grad = ctx.createRadialGradient(WIDTH - BORDER_WIDTH / 2, y + 35, 6, WIDTH - BORDER_WIDTH / 2, y + 35, 14);
        grad.addColorStop(0, '#43a047');
        grad.addColorStop(1, '#1b5e20');
        ctx.beginPath();
        ctx.arc(WIDTH - BORDER_WIDTH / 2, y + 35, 14, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }
    // Road with gradient
    let roadGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    roadGrad.addColorStop(0, '#555');
    roadGrad.addColorStop(1, '#222');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(BORDER_WIDTH, 0, WIDTH - 2 * BORDER_WIDTH, HEIGHT);
    // Lane dividers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    for (let i = 1; i < LANES; i++) {
        for (let y = -30 + (roadOffset % 40); y < HEIGHT; y += 40) {
            ctx.beginPath();
            ctx.moveTo(BORDER_WIDTH + i * LANE_WIDTH, y);
            ctx.lineTo(BORDER_WIDTH + i * LANE_WIDTH, y + 20);
            ctx.stroke();
        }
    }
    // Rounded borders
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.arc(BORDER_WIDTH, 0, 30, Math.PI, 1.5 * Math.PI);
    ctx.arc(WIDTH - BORDER_WIDTH, 0, 30, 1.5 * Math.PI, 0);
    ctx.arc(WIDTH - BORDER_WIDTH, HEIGHT, 30, 0, 0.5 * Math.PI);
    ctx.arc(BORDER_WIDTH, HEIGHT, 30, 0.5 * Math.PI, Math.PI);
    ctx.closePath();
    ctx.fill();
}

function drawCar(x, y, color) {
    ctx.save();
    ctx.translate(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT / 2);
    ctx.rotate(-Math.PI / 2); // Player faces down
    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Body
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-PLAYER_HEIGHT / 2 + 8, -PLAYER_WIDTH / 2 + 8);
    ctx.lineTo(PLAYER_HEIGHT / 2 - 8, -PLAYER_WIDTH / 2 + 8);
    ctx.lineTo(PLAYER_HEIGHT / 2 - 4, 0);
    ctx.lineTo(PLAYER_HEIGHT / 2 - 8, PLAYER_WIDTH / 2 - 8);
    ctx.lineTo(-PLAYER_HEIGHT / 2 + 8, PLAYER_WIDTH / 2 - 8);
    ctx.lineTo(-PLAYER_HEIGHT / 2 + 4, 0);
    ctx.closePath();
    ctx.fill();
    // Windows
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, -12, 24, 24);
    // Wheels
    ctx.fillStyle = '#222';
    ctx.fillRect(-PLAYER_HEIGHT / 2 + 2, -PLAYER_WIDTH / 2 + 2, 8, 12);
    ctx.fillRect(PLAYER_HEIGHT / 2 - 10, -PLAYER_WIDTH / 2 + 2, 8, 12);
    ctx.fillRect(-PLAYER_HEIGHT / 2 + 2, PLAYER_WIDTH / 2 - 14, 8, 12);
    ctx.fillRect(PLAYER_HEIGHT / 2 - 10, PLAYER_WIDTH / 2 - 14, 8, 12);
    // Highlight
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, -10, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawOpponentCar(x, y, color) {
    ctx.save();
    ctx.translate(x + OPPONENT_WIDTH / 2, y + OPPONENT_HEIGHT / 2);
    ctx.rotate(Math.PI / 2); // Opponents face up
    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Body
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-OPPONENT_HEIGHT / 2 + 8, -OPPONENT_WIDTH / 2 + 8);
    ctx.lineTo(OPPONENT_HEIGHT / 2 - 8, -OPPONENT_WIDTH / 2 + 8);
    ctx.lineTo(OPPONENT_HEIGHT / 2 - 4, 0);
    ctx.lineTo(OPPONENT_HEIGHT / 2 - 8, OPPONENT_WIDTH / 2 - 8);
    ctx.lineTo(-OPPONENT_HEIGHT / 2 + 8, OPPONENT_WIDTH / 2 - 8);
    ctx.lineTo(-OPPONENT_HEIGHT / 2 + 4, 0);
    ctx.closePath();
    ctx.fill();
    // Windows
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, -12, 24, 24);
    // Wheels
    ctx.fillStyle = '#222';
    ctx.fillRect(-OPPONENT_HEIGHT / 2 + 2, -OPPONENT_WIDTH / 2 + 2, 8, 12);
    ctx.fillRect(OPPONENT_HEIGHT / 2 - 10, -OPPONENT_WIDTH / 2 + 2, 8, 12);
    ctx.fillRect(-OPPONENT_HEIGHT / 2 + 2, OPPONENT_WIDTH / 2 - 14, 8, 12);
    ctx.fillRect(OPPONENT_HEIGHT / 2 - 10, OPPONENT_WIDTH / 2 - 14, 8, 12);
    // Highlight
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, -10, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function resetGame() {
    // Place player in a random lane at the bottom
    const playerLane = Math.floor(LANES / 2);
    player = {
        lane: playerLane,
        x: BORDER_WIDTH + playerLane * LANE_WIDTH + (LANE_WIDTH - PLAYER_WIDTH) / 2,
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
    // Pick a random lane
    const lane = Math.floor(Math.random() * LANES);
    const x = BORDER_WIDTH + lane * LANE_WIDTH + (LANE_WIDTH - OPPONENT_WIDTH) / 2;
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
    
    // Create explosion particles
    for (let i = 0; i < 15; i++) {
        particles.push(createParticle(
            player.x + PLAYER_WIDTH / 2,
            player.y + PLAYER_HEIGHT / 2,
            '#ff4444',
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            30
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
        opponentCars[i].y += opponentCars[i].speed * speedFactor;
        if (opponentCars[i].y > HEIGHT) {
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
            
            // Create collection particles
            for (let j = 0; j < 8; j++) {
                particles.push(createParticle(
                    powerUp.x + 10,
                    powerUp.y + 10,
                    config.color,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    20
                ));
            }
            
            powerUps.splice(i, 1);
        }
    }
    
    // Add exhaust particles
    if (frameCount % 3 === 0) {
        particles.push(createParticle(
            player.x + PLAYER_WIDTH / 2 + (Math.random() - 0.5) * 10,
            player.y + PLAYER_HEIGHT,
            player.speedBoost ? '#ff8800' : '#666',
            (Math.random() - 0.5) * 2,
            2 + Math.random() * 3,
            15
        ));
    }
    
    // Update particles
    updateParticles();
    
    // Update score
    if (running) score += Math.floor(speedFactor);
    updateScoreDisplay();
    
    // Render
    drawRoad();
    drawCar(player.x, player.y, player.color);
    
    // Draw shield effect
    if (player.shielded) {
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(frameCount * 0.3);
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, 45, 0, Math.PI * 2);
        ctx.stroke();
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


restartBtn.addEventListener('click', resetGame);
startBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', showMenu);

// Start in menu
showMenu();

// Only start game when user clicks start

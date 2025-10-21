let gunAngle = 0; // in degrees
let score = 0;
let highScore = 0;
let gamePaused = false;
let alienInterval;
let level = 1;
let spawnSpeed = 4000; // initial spawn interval in ms

// Mouse movement rotates gun
document.addEventListener('mousemove', function(e) {
    const gun = document.getElementById('gun');
    const gameArea = document.getElementById('gameArea');
    if (!gun || !gameArea) return;

    const gunRect = gun.getBoundingClientRect();
    const gunCenterX = gunRect.left + gunRect.width / 2;
    const gunCenterY = gunRect.top + gunRect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dx = mouseX - gunCenterX;
    const dy = mouseY - gunCenterY;
    gunAngle = Math.atan2(dy, dx) * 180 / Math.PI;

    gun.style.transform = `translate(-50%, -50%) rotate(${gunAngle}deg)`;
});

// Shoot on left mouse click
document.addEventListener('mousedown', function(e) {
    if (gamePaused) return;
    if (e.button === 0) { // Left click
        const gun = document.getElementById('gun');
        if (!gun) return;
        shootBullet(gunAngle);
    }
});

// Shoot on space key press
document.addEventListener('keydown', function(e) {
    if (e.code === 'Escape' && !gamePaused) {
        pauseGame();
        return;
    }
    if (gamePaused) return;
    if (e.code === 'Space') {
        const gun = document.getElementById('gun');
        if (!gun) return;
        shootBullet(gunAngle);
    }
});

// Danger zone collision check and pause logic
function spawnAlien() {
    if (gamePaused) return;
    const gameArea = document.getElementById('gameArea');
    const alien = document.createElement('div');
    alien.className = 'alien';

    const areaRect = gameArea.getBoundingClientRect();
    const x = Math.random() * (areaRect.width - 60) + 30;
    alien.style.left = `${x}px`;
    alien.style.top = `-50px`;

    gameArea.appendChild(alien);

    let y = -50;
    const speed = 1 + Math.random() * 1.5;

    function moveAlien() {
        if (gamePaused) return;
        y += speed;
        alien.style.top = `${y}px`;

        // Check collision with danger zone
        const dangerZone = document.getElementById('dangerZone');
        const alienRect = alien.getBoundingClientRect();
        const dangerRect = dangerZone.getBoundingClientRect();
        if (
            alienRect.bottom >= dangerRect.top &&
            alienRect.left < dangerRect.right &&
            alienRect.right > dangerRect.left
        ) {
            pauseGame();
            alien.remove();
            return;
        }

        // Remove if out of game area
        if (y < areaRect.height + 50) {
            requestAnimationFrame(moveAlien);
        } else {
            alien.remove();
            updateScore(0);
        }
    }
    moveAlien();
}

function updateScore(amount) {
    score += amount;
    if (score < 0) score = 0;
    document.getElementById('scoreValue').textContent = score;

    // Level up every 15 points
    const newLevel = Math.floor(score / 15) + 1;
    if (newLevel > level) {
        level = newLevel;
        increaseDifficulty();
    }
}

function increaseDifficulty() {
    // Increase spawn speed (minimum 1000ms)
    spawnSpeed = Math.max(1000, 5000 - (level - 1) * 500);
    clearInterval(alienInterval);
    alienInterval = setInterval(spawnAlien, spawnSpeed);

    // Optionally, show level somewhere
    let levelDisplay = document.getElementById('levelDisplay');
    if (!levelDisplay) {
        levelDisplay = document.createElement('div');
        levelDisplay.id = 'levelDisplay';
        levelDisplay.style.position = 'absolute';
        levelDisplay.style.top = '16px';
        levelDisplay.style.left = '24px';
        levelDisplay.style.fontSize = '1.5rem';
        levelDisplay.style.color = '#fff';
        levelDisplay.style.background = 'rgba(0,0,0,0.5)';
        levelDisplay.style.padding = '6px 16px';
        levelDisplay.style.borderRadius = '12px';
        levelDisplay.style.zIndex = '10';
        document.getElementById('gameArea').appendChild(levelDisplay);
    }
    levelDisplay.textContent = `Level: ${level}`;
}

function pauseGame() {
    gamePaused = true;
    highScore = Math.max(highScore, score);
    document.getElementById('highScoreValue').textContent = highScore;
    document.getElementById('pauseOverlay').style.display = 'flex';
    clearInterval(alienInterval);

    // Show Train button only if score is exactly 5
    let trainBtn = document.getElementById('trainBtn');
    if (score === 5) {
        if (!trainBtn) {
            trainBtn = document.createElement('button');
            trainBtn.id = 'trainBtn';
            trainBtn.textContent = 'Train 🚂';
            trainBtn.style.marginTop = '12px';
            trainBtn.onclick = function() {
                window.location.href = '../train games/train.html';
            };
            document.querySelector('.pauseBox').appendChild(trainBtn);
        }
        trainBtn.style.display = 'inline-block';
    } else if (trainBtn) {
        trainBtn.style.display = 'none';
    }
}

// When replaying, reset level and spawn speed
function replayGame() {
    score = 0;
    level = 1;
    spawnSpeed = 5000;
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('pauseOverlay').style.display = 'none';
    gamePaused = false;
    clearInterval(alienInterval);
    alienInterval = setInterval(spawnAlien, spawnSpeed);

    // Reset level display
    let levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) levelDisplay.textContent = `Level: ${level}`;
}

function shootBullet(angle) {
    const gameArea = document.getElementById('gameArea');
    const gun = document.getElementById('gun');
    if (!gameArea || !gun) return;

    const bullet = document.createElement('div');
    bullet.className = 'bullet';

    // Start bullet at gun's center
    const gunRect = gun.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    const startX = gunRect.left + gunRect.width / 2 - areaRect.left;
    const startY = gunRect.top + gunRect.height / 2 - areaRect.top;

    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;

    gameArea.appendChild(bullet);

    // Move bullet in direction of angle
    let x = startX;
    let y = startY;
    const speed = 8;
    const rad = angle * Math.PI / 180;

    function moveBullet() {
        x += Math.cos(rad) * speed;
        y += Math.sin(rad) * speed;
        bullet.style.left = `${x}px`;
        bullet.style.top = `${y}px`;

        // Check collision with aliens
        const aliens = document.querySelectorAll('.alien');
        for (let alien of aliens) {
            const bulletRect = bullet.getBoundingClientRect();
            const alienRect = alien.getBoundingClientRect();
            if (
                bulletRect.left < alienRect.right &&
                bulletRect.right > alienRect.left &&
                bulletRect.top < alienRect.bottom &&
                bulletRect.bottom > alienRect.top
            ) {
                alien.remove();
                bullet.remove();
                updateScore(5); // Increase score for killing alien
                return;
            }
        }

        // Remove bullet if out of bounds
        if (
            x < 0 || x > areaRect.width ||
            y < 0 || y > areaRect.height
        ) {
            bullet.remove();
            return;
        }

        requestAnimationFrame(moveBullet);
    }
    moveBullet();
}

// Start alien spawn interval
alienInterval = setInterval(spawnAlien, spawnSpeed);

window.addEventListener('DOMContentLoaded', function() {
    const gun = document.getElementById('gun');
    const gameArea = document.getElementById('gameArea');
    if (!gun || !gameArea) return;

    // Center of screen as default
    const mouseX = window.innerWidth / 2;
    const mouseY = window.innerHeight / 2;

    const gunRect = gun.getBoundingClientRect();
    const gunCenterX = gunRect.left + gunRect.width / 2;
    const gunCenterY = gunRect.top + gunRect.height / 2;
    const dx = mouseX - gunCenterX;
    const dy = mouseY - gunCenterY;
    gunAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    gun.style.transform = `translate(-50%, -50%) rotate(${gunAngle}deg)`;
});
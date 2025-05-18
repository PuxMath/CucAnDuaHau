const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const gameWinDisplay = document.getElementById('game-win');
const finalScoreWinDisplay = document.getElementById('final-score-win');
const backgroundMusic = document.getElementById('background-music');

// Mobile control buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Game variables

const gridSize = 15;
const cellSize = Math.floor(canvas.width / gridSize);

let gameInterval;
let score = 0;
let gameRunning = false;
let level = 1;
let lives = 3;
let powerUpTimer = 0;
const powerUpDuration = 600; // 10 seconds at 60 FPS
const ghostRespawnDelay = 300; // 5 seconds at 60 FPS

// Direction constants
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

// Create Player
let player = {
    x: 1,
    y: 1,
    direction: DIRECTIONS.NONE,
    nextDirection: DIRECTIONS.NONE,
    speed: 5,
    moveCounter: 0,
    movePending: false
};

// Create Ghosts
let ghosts = [];

// Game map (0 = wall, 1 = dot, 2 = power pellet, 3 = empty)
let gameMap = [];

// Assets
const playerImage = new Image();
const ghostImage = new Image();
const watermelonImage = new Image();

playerImage.src = "Cuc.jpg";
ghostImage.src = "/api/placeholder/40/40";
watermelonImage.src = "melon.svg";

// Ensure watermelon image loads
watermelonImage.onload = () => {
    console.log("Cute watermelon image loaded successfully!");
    render();
};
watermelonImage.onerror = () => {
    console.error("Failed to load watermelon image");
};

// Start the game
startBtn.addEventListener('click', startGame);

// Mobile controls
upBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayerOneCell(DIRECTIONS.UP);
});

downBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayerOneCell(DIRECTIONS.DOWN);
});

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayerOneCell(DIRECTIONS.LEFT);
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    movePlayerOneCell(DIRECTIONS.RIGHT);
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            player.nextDirection = DIRECTIONS.UP;
            break;
        case 'ArrowDown':
            player.nextDirection = DIRECTIONS.DOWN;
            break;
        case 'ArrowLeft':
            player.nextDirection = DIRECTIONS.LEFT;
            break;
        case 'ArrowRight':
            player.nextDirection = DIRECTIONS.RIGHT;
            break;
    }
});

function initializeGame() {
    gameMap = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
        [0, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 0],
        [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 3, 3, 3, 0, 1, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 0],
        [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    
    player = {
        x: 1,
        y: 1,
        direction: DIRECTIONS.NONE,
        nextDirection: DIRECTIONS.NONE,
        speed: 5,
        moveCounter: 0,
        movePending: false
    };
    
    ghosts = [
        { x: 7, y: 7, direction: DIRECTIONS.UP, speed: 7, moveCounter: 0, vulnerable: false, eaten: false, respawnTimer: 0 },
        { x: 8, y: 7, direction: DIRECTIONS.LEFT, speed: 6, moveCounter: 0, vulnerable: false, eaten: false, respawnTimer: 0 }
    ];
    
    score = 0;
    scoreDisplay.textContent = score;
    powerUpTimer = 0;
    
    gameOverDisplay.style.display = 'none';
    gameWinDisplay.style.display = 'none';
}

function startGame() {
    if (gameRunning) return;
    
    initializeGame();
    gameRunning = true;
    gameInterval = setInterval(gameLoop, 1000 / 60);
    startBtn.textContent = 'Reset Game';
    canvas.focus();
    backgroundMusic.play();
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    gameOverDisplay.style.display = 'flex';
    finalScoreDisplay.textContent = score;
    gameWinDisplay.style.display = 'none';
    startBtn.textContent = 'Start Game';
}

function winGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    gameWinDisplay.style.display = 'flex';
    finalScoreWinDisplay.textContent = score;
    gameOverDisplay.style.display = 'none';
    startBtn.textContent = 'Start Game';
}

function movePlayerOneCell(direction) {
    if (!gameRunning) return;
    
    const nextX = player.x + direction.x;
    const nextY = player.y + direction.y;
    
    if (!isWall(nextX, nextY)) {
        player.x = nextX;
        player.y = nextY;
        player.direction = direction;
        player.movePending = true;
        
        if (gameMap[player.y][player.x] === 1) {
            gameMap[player.y][player.x] = 3;
            score += 10;
            scoreDisplay.textContent = score;
        } else if (gameMap[player.y][player.x] === 2) {
            gameMap[player.y][player.x] = 3;
            score += 50;
            scoreDisplay.textContent = score;
            activatePowerUp();
        }
    }
}

function activatePowerUp() {
    powerUpTimer = powerUpDuration;
    ghosts.forEach(ghost => {
        if (!ghost.eaten) {
            ghost.vulnerable = true;
        }
    });
}

function checkCollision(ghost) {
    if (ghost.x === player.x && ghost.y === player.y) {
        console.log(`Exact collision detected: Ghost at (${ghost.x}, ${ghost.y}), Player at (${player.x}, ${player.y}), Vulnerable: ${ghost.vulnerable}`);
        return true;
    }
    
    const buffer = cellSize * 0.1;
    const playerBox = {
        left: player.x * cellSize + buffer,
        right: (player.x + 1) * cellSize - buffer,
        top: player.y * cellSize + buffer,
        bottom: (player.y + 1) * cellSize - buffer
    };
    const ghostBox = {
        left: ghost.x * cellSize + buffer,
        right: (ghost.x + 1) * cellSize - buffer,
        top: ghost.y * cellSize + buffer,
        bottom: (ghost.y + 1) * cellSize - buffer
    };
    
    if (playerBox.left < ghostBox.right &&
        playerBox.right > ghostBox.left &&
        playerBox.top < ghostBox.bottom &&
        playerBox.bottom > ghostBox.top) {
        console.log(`Bounding box collision detected: Ghost at (${ghost.x}, ${ghost.y}), Player at (${player.x}, ${player.y}), Vulnerable: ${ghost.vulnerable}`);
        return true;
    }
    
    return false;
}

function gameLoop() {
    update();
    render();
    
    if (checkForWin()) {
        winGame();
    }
}

function update() {
    player.moveCounter++;
    if (player.moveCounter >= player.speed) {
        player.moveCounter = 0;
        
        if (player.nextDirection !== DIRECTIONS.NONE) {
            const nextX = player.x + player.nextDirection.x;
            const nextY = player.y + player.nextDirection.y;
            
            if (!isWall(nextX, nextY)) {
                player.direction = player.nextDirection;
            }
        }
        
        if (player.direction !== DIRECTIONS.NONE && !player.movePending) {
            const nextX = player.x + player.direction.x;
            const nextY = player.y + player.direction.y;
            
            if (!isWall(nextX, nextY)) {
                player.x = nextX;
                player.y = nextY;
                
                if (gameMap[player.y][player.x] === 1) {
                    gameMap[player.y][player.x] = 3;
                    score += 10;
                    scoreDisplay.textContent = score;
                } else if (gameMap[player.y][player.x] === 2) {
                    gameMap[player.y][player.x] = 3;
                    score += 50;
                    scoreDisplay.textContent = score;
                    activatePowerUp();
                }
            }
        }
    }
    
    player.movePending = false;
    
    if (powerUpTimer > 0) {
        powerUpTimer--;
        if (powerUpTimer === 0) {
            ghosts.forEach(ghost => {
                if (!ghost.eaten) {
                    ghost.vulnerable = false;
                    console.log(`Ghost at (${ghost.x}, ${ghost.y}) is no longer vulnerable`);
                }
            });
        }
    }
    
    ghosts.forEach(ghost => {
        if (ghost.eaten) {
            ghost.respawnTimer--;
            if (ghost.respawnTimer <= 0) {
                ghost.x = 7 + Math.floor(Math.random() * 2);
                ghost.y = 7;
                ghost.direction = Object.values(DIRECTIONS)[Math.floor(Math.random() * 4)];
                ghost.eaten = false;
                ghost.vulnerable = powerUpTimer > 0;
                ghost.moveCounter = 0;
                console.log(`Ghost respawned at (${ghost.x}, ${ghost.y})`);
            }
            return;
        }
        
        if (checkCollision(ghost)) {
            if (ghost.vulnerable) {
                ghost.eaten = true;
                ghost.respawnTimer = ghostRespawnDelay;
                score += 200;
                scoreDisplay.textContent = score;
                console.log(`Ghost eaten, score: ${score}`);
            } else {
                endGame();
                console.log('Game over due to collision');
            }
            return;
        }
        
        ghost.moveCounter++;
        if (ghost.moveCounter >= ghost.speed) {
            ghost.moveCounter = 0;
            
            const possibleDirections = [];
            
            if (!isWall(ghost.x + DIRECTIONS.UP.x, ghost.y + DIRECTIONS.UP.y) && 
                !directionsAreOpposite(ghost.direction, DIRECTIONS.UP)) {
                possibleDirections.push(DIRECTIONS.UP);
            }
            if (!isWall(ghost.x + DIRECTIONS.DOWN.x, ghost.y + DIRECTIONS.DOWN.y) && 
                !directionsAreOpposite(ghost.direction, DIRECTIONS.DOWN)) {
                possibleDirections.push(DIRECTIONS.DOWN);
            }
            if (!isWall(ghost.x + DIRECTIONS.LEFT.x, ghost.y + DIRECTIONS.LEFT.y) && 
                !directionsAreOpposite(ghost.direction, DIRECTIONS.LEFT)) {
                possibleDirections.push(DIRECTIONS.LEFT);
            }
            if (!isWall(ghost.x + DIRECTIONS.RIGHT.x, ghost.y + DIRECTIONS.RIGHT.y) && 
                !directionsAreOpposite(ghost.direction, DIRECTIONS.RIGHT)) {
                possibleDirections.push(DIRECTIONS.RIGHT);
            }
            
            if (!isWall(ghost.x + ghost.direction.x, ghost.y + ghost.direction.y)) {
                possibleDirections.push(ghost.direction);
                possibleDirections.push(ghost.direction);
            }
            
            if (possibleDirections.length > 0) {
                ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            } else {
                ghost.direction = reverseDirection(ghost.direction);
            }
            
            ghost.x += ghost.direction.x;
            ghost.y += ghost.direction.y;
            
            if (checkCollision(ghost)) {
                if (ghost.vulnerable) {
                    ghost.eaten = true;
                    ghost.respawnTimer = ghostRespawnDelay;
                    score += 200;
                    scoreDisplay.textContent = score;
                    console.log(`Ghost eaten, score: ${score}`);
                } else {
                    endGame();
                    console.log('Game over due to collision');
                }
            }
        }
    });
}

function directionsAreOpposite(dir1, dir2) {
    return dir1.x === -dir2.x && dir1.y === -dir2.y;
}

function reverseDirection(dir) {
    return { x: -dir.x, y: -dir.y };
}

function isWall(x, y) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
        return true;
    }
    
    return gameMap[y][x] === 0;
}

function checkForWin() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (gameMap[y][x] === 1 || gameMap[y][x] === 2) {
                return false;
            }
        }
    }
    return true;
}

function render() {
    ctx.fillStyle = '#ffe6f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (gameMap[y][x] === 0) {
                ctx.fillStyle = '#ff69b4';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                
                ctx.fillStyle = '#ff1493';
                ctx.fillRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4);
            } else if (gameMap[y][x] === 1) {
                // Regular dots: Small watermelon with subtle pulse
                const dotSize = cellSize / 2 * (1 + 0.05 * Math.sin(Date.now() / 300));
                const offset = (cellSize - dotSize) / 2;
                
                if (watermelonImage.complete && watermelonImage.naturalWidth !== 0) {
                    ctx.drawImage(
                        watermelonImage,
                        x * cellSize + offset,
                        y * cellSize + offset,
                        dotSize,
                        dotSize
                    );
                } else {
                    // Fallback: Red circle
                    ctx.fillStyle = '#ff6b6b';
                    ctx.beginPath();
                    ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, dotSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (gameMap[y][x] === 2) {
                // Power pellets: Larger watermelon with glow and pulse
                const pelletSize = cellSize / 1.5 * (1 + 0.1 * Math.sin(Date.now() / 200));
                const offset = (cellSize - pelletSize) / 2;
                
                // Add glow effect
                ctx.shadowColor = '#ff69b4';
                ctx.shadowBlur = 15;
                
                if (watermelonImage.complete && watermelonImage.naturalWidth !== 0) {
                    ctx.drawImage(
                        watermelonImage,
                        x * cellSize + offset,
                        y * cellSize + offset,
                        pelletSize,
                        pelletSize
                    );
                } else {
                    // Fallback: Red circle
                    ctx.fillStyle = '#ff6b6b';
                    ctx.beginPath();
                    ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, pelletSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Reset shadow
                ctx.shadowBlur = 0;
            }
        }
    }
    
    const playerX = player.x * cellSize;
    const playerY = player.y * cellSize;
    
    ctx.save();
    ctx.translate(playerX + cellSize / 2, playerY + cellSize / 2);
    
    let rotationAngle = 0;
    if (player.direction === DIRECTIONS.UP) rotationAngle = -Math.PI/2;
    else if (player.direction === DIRECTIONS.DOWN) rotationAngle = Math.PI/2;
    else if (player.direction === DIRECTIONS.LEFT) rotationAngle = Math.PI;
    else if (player.direction === DIRECTIONS.RIGHT) rotationAngle = 0;
    
    ctx.rotate(rotationAngle);
    
    ctx.drawImage(playerImage, -cellSize / 2, -cellSize / 2, cellSize, cellSize);
    
    ctx.restore();
    
    ghosts.forEach((ghost, index) => {
        if (ghost.eaten) return;
        
        const ghostX = ghost.x * cellSize + cellSize / 2;
        const ghostY = ghost.y * cellSize + cellSize / 2;
        
        ctx.fillStyle = ghost.vulnerable ? '#0000ff' : getGhostColor(index);
        
        ctx.beginPath();
        ctx.arc(ghostX, ghostY - cellSize/8, cellSize/2 - 2, Math.PI, 0, false);
        ctx.lineTo(ghostX + cellSize/2 - 2, ghostY + cellSize/2 - 2);
        
        const waveSize = cellSize/8;
        const segments = 3;
        const segmentWidth = (cellSize - 4) / segments;
        
        for (let i = 0; i < segments; i++) {
            ctx.lineTo(ghostX + cellSize/2 - 2 - segmentWidth * (i+0.5), ghostY + cellSize/2 - 2 - waveSize);
            ctx.lineTo(ghostX + cellSize/2 - 2 - segmentWidth * (i+1), ghostY + cellSize/2 - 2);
        }
        
        ctx.lineTo(ghostX - cellSize/2 + 2, ghostY + cellSize/2 - 2);
        ctx.lineTo(ghostX - cellSize/2 + 2, ghostY - cellSize/8);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ghostX - cellSize/6, ghostY - cellSize/6, cellSize/8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ghostX + cellSize/6, ghostY - cellSize/6, cellSize/8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        if (ghost.direction === DIRECTIONS.UP) pupilOffsetY = -2;
        else if (ghost.direction === DIRECTIONS.DOWN) pupilOffsetY = 2;
        else if (ghost.direction === DIRECTIONS.LEFT) pupilOffsetX = -2;
        else if (ghost.direction === DIRECTIONS.RIGHT) pupilOffsetX = 2;
        
        ctx.beginPath();
        ctx.arc(ghostX - cellSize/6 + pupilOffsetX, ghostY - cellSize/6 + pupilOffsetY, cellSize/16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ghostX + cellSize/6 + pupilOffsetX, ghostY - cellSize/6 + pupilOffsetY, cellSize/16, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.fillStyle = '#ff1493';
    ctx.font = '16px Arial';
    ctx.fillText(`Level: ${level}`, 10, canvas.height - 10);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 80, canvas.height - 10);
}

function getGhostColor(index) {
    const colors = ['#ff708e', '#ff9ad5'];
    return colors[index % colors.length];
}

initializeGame();
render();
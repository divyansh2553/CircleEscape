const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

let bird = { x: 50, y: 150, radius: 10, gravity: 0.6, lift: -12, velocity: 0 };
let pipes = [];
let pipeGap = 120;
let pipeSpeed = 2;
let frame = 0;
let score = 0;
let isPlaying = false;
let level = 'easy';
let highScores = {
    easy: localStorage.getItem('highScoreEasy') || 0,
    medium: localStorage.getItem('highScoreMedium') || 0
};

const birdImage = new Image();
birdImage.src = 'bird.png';

const pipeImage = new Image();
pipeImage.src = 'pipe.png';

document.getElementById('levelSelect').onchange = (e) => {
    level = e.target.value;
    setLevel(level);
    updateHighScoreDisplay();
};

document.getElementById('playButton').onclick = () => {
    if (!isPlaying) {
        isPlaying = true;
        loop();
    }
};

document.getElementById('pauseButton').onclick = () => {
    isPlaying = false;
};

// Add event listener for the spacebar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isPlaying) {
        bird.velocity = bird.lift;
        e.preventDefault(); // Prevent default scrolling behavior
    }
});

function setLevel(selectedLevel) {
    if (selectedLevel === 'easy') {
        bird.gravity = 0.6;
        bird.lift = -12;
        pipeGap = 120;
        pipeSpeed = 2;
    } else if (selectedLevel === 'medium') {
        bird.gravity = 0.8;
        bird.lift = -10;
        pipeGap = 100;
        pipeSpeed = 3;
    }
    score = 0;
    pipes = [];
    bird.y = 150;
    document.getElementById('currentScore').innerText = 'Score: ' + score;
}

function drawBird() {
    ctx.drawImage(birdImage, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
}

function createPipes() {
    if (frame % 100 === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 50)) + 50;
        pipes.push({ x: canvas.width, top: pipeHeight, bottom: pipeHeight + pipeGap });
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImage, pipe.x, 0, 20, pipe.top);
        ctx.drawImage(pipeImage, pipe.x, pipe.bottom, 20, canvas.height - pipe.bottom);
        pipe.x -= pipeSpeed;

        if (pipe.x + 20 < 0) {
            pipes.shift();
            score++;
            document.getElementById('currentScore').innerText = 'Score: ' + score;
        }

        if (
            bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + 20 &&
            (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.bottom)
        ) {
            resetGame();
        }
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.velocity *= 0.9;
    bird.y += bird.velocity;

    // End game if the bird hits the top or bottom border
    if (bird.y + bird.radius > canvas.height) {
        bird.y = canvas.height - bird.radius;
        bird.velocity = 0;
        resetGame(); // End the game when hitting the bottom
    } else if (bird.y - bird.radius < 0) {
        bird.y = bird.radius;
        bird.velocity = 0;
        resetGame(); // End the game when hitting the top
    }
}

function resetGame() {
    isPlaying = false;
    if (score > highScores[level]) {
        highScores[level] = score;
        localStorage.setItem('highScore' + capitalizeFirstLetter(level), score);
        updateHighScoreDisplay();
    }
    alert('Game Over! Your score: ' + score);
    score = 0; // Reset current score
    document.getElementById('currentScore').innerText = 'Score: ' + score;
    pipes = [];
    bird.y = 150;
}

function updateHighScoreDisplay() {
    const highScoreElement = document.getElementById('highScore');
    highScoreElement.innerText = `High Score (${capitalizeFirstLetter(level)}): ${highScores[level]}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function loop() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    createPipes();
    drawPipes();
    updateBird();

    frame++;
    requestAnimationFrame(loop);
}

// Initial setup
setLevel('easy');
updateHighScoreDisplay();

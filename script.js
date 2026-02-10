const grid = document.getElementById('grid');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const restartBtn = document.getElementById('restart-btn');
const themeSelect = document.getElementById('theme');
const modal = document.getElementById('modal');
const modalRestart = document.getElementById('modal-restart');
const finalTime = document.getElementById('final-time');
const finalMoves = document.getElementById('final-moves');

// Theme Data
const themes = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    fruits: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'],
    emoji: ['😀', '😂', '😍', '😎', '😭', '😡', '😱', '🤔'],
    // Placeholder filenames - User should replace these or name files accordingly
    custom: ['img1.png', 'img2.png', 'img3.png', 'img4.png', 'img5.png', 'img6.png', 'img7.png', 'img8.png']
};

let currentTheme = 'custom';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = null;
let seconds = 0;
let isGameActive = false;
let lockBoard = false;

let fireworkInterval = null;

// Initialize Game
function initGame() {
    // Reset State
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    isGameActive = false;
    lockBoard = false;

    // Stop Fireworks
    clearInterval(fireworkInterval);
    // Remove any leftover particles in modal
    const modalParticles = modal.querySelectorAll('.particle');
    modalParticles.forEach(p => p.remove());

    // Update UI
    movesDisplay.textContent = moves;
    timeDisplay.textContent = '00:00';
    clearInterval(timer);
    modal.classList.add('hidden');

    // Generate Board
    generateCards();
}

function generateCards() {
    grid.innerHTML = '';
    const items = themes[currentTheme];
    // Create pairs
    const deck = [...items, ...items];
    // Shuffle
    shuffle(deck);

    deck.forEach(item => {
        const card = createCardElement(item);
        grid.appendChild(card);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCardElement(item) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = item;

    const frontFace = document.createElement('div');
    frontFace.classList.add('card-face', 'card-front');
    // Optional: Add a pattern or logo to the back

    const backFace = document.createElement('div');
    backFace.classList.add('card-face', 'card-back');

    // Check if using custom image theme
    if (currentTheme === 'custom') {
        const img = document.createElement('img');
        img.src = `assets/${item}`;
        img.alt = 'card image';
        img.classList.add('card-image');
        backFace.appendChild(img);
        // Handle image load error
        img.onerror = () => {
            img.style.display = 'none';
            backFace.textContent = '?'; // Fallback
        };
    } else {
        backFace.textContent = item;
    }

    card.appendChild(frontFace);
    card.appendChild(backFace);

    card.addEventListener('click', flipCard);
    return card;
}

function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return; // Optimize: don't allow clicking same card
    if (this.classList.contains('flipped')) return; // Already matched or flipped

    // Start timer on first move
    if (!isGameActive) {
        startTimer();
        isGameActive = true;
    }

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
        incrementMoves();
    }
}

function checkForMatch() {
    let [card1, card2] = flippedCards;
    const isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
        // Lock board to prevent interactions while animation plays
        lockBoard = true;

        setTimeout(() => {
            disableCards();
            matchedPairs++;

            // Trigger Effects
            triggerMatchEffects(card1);
            triggerMatchEffects(card2);

            if (matchedPairs === themes[currentTheme].length) {
                endGame();
            }
            // Unlock after effects start
            lockBoard = false;
        }, 600); // Wait for flip to complete (0.6s)
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards.forEach(card => {
        card.classList.add('matched'); // Triggers CSS animation
    });
    flippedCards = [];
}

function triggerMatchEffects(card) {
    const rect = card.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    spawnParticles(x, y, document.body, 'match');
}

function launchFirework() {
    // Random position within window
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.8; // Avoid very bottom

    spawnParticles(x, y, modal, 'firework');
}

function spawnParticles(x, y, container = document.body, type = 'match') {
    const particleCount = 60;
    const colors = ['#ff7675', '#a29bfe', '#55efc4', '#ffeaa7', '#fab1a0', '#fdcb6e', '#e17055'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random color
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        let size, velocity, duration;

        if (type === 'match') {
            // Match: Fast, Small/Medium, Short
            size = 10 + Math.random() * 20; // 10-30px
            velocity = 200 + Math.random() * 300; // Fast
            duration = 1; // 1s
        } else {
            // Firework: Slow, Large, Long
            size = 20 + Math.random() * 40; // 20-60px
            velocity = (200 + Math.random() * 300) * 0.5; // Slow
            duration = 2; // 2s
        }

        particle.style.setProperty('--size', `${size}px`);
        particle.style.setProperty('--duration', `${duration}s`);

        // Random direction
        const angle = Math.random() * Math.PI * 2;

        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        // Positioning
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        if (type === 'firework') {
            particle.style.zIndex = '1'; // Behind modal-content (z-index 10)
        }

        container.appendChild(particle);

        // Cleanup
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        flippedCards = [];
        lockBoard = false;
    }, 1000);
}

function incrementMoves() {
    moves++;
    movesDisplay.textContent = moves;
}

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeDisplay.textContent = `${pad(mins)}:${pad(secs)}`;
    }, 1000);
}

function pad(val) {
    return val < 10 ? '0' + val : val;
}

function endGame() {
    clearInterval(timer);
    setTimeout(() => {
        finalTime.textContent = timeDisplay.textContent;
        finalMoves.textContent = moves;
        modal.classList.remove('hidden');

        // Trigger Fireworks loop
        launchFirework(); // Immediate one
        fireworkInterval = setInterval(launchFirework, 1000); // Every 1s
    }, 500);
}

// Event Listeners
restartBtn.addEventListener('click', initGame);
modalRestart.addEventListener('click', initGame);

themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    initGame();
});

// Start initially
initGame();

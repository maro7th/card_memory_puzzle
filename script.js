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
    emoji: ['😀', '😂', '😍', '😎', '😭', '😡', '😱', '🤔']
};

let currentTheme = 'animals';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = null;
let seconds = 0;
let isGameActive = false;
let lockBoard = false;

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
    backFace.textContent = item;

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
        disableCards();
        matchedPairs++;
        if (matchedPairs === themes[currentTheme].length) {
            endGame();
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards = [];
    // Keep them flipped (visual) but logically handled
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

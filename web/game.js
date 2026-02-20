// Game Constants (defined in ai.js)
// const BOARD_SIZE = 9;
// const EMPTY = '_';

// Game State
let board = [];
let currentPlayer = 'B'; // B = Blueberry, W = Strawberry
let gameMode = null; // 'two-player' or 'ai'
let difficulty = 'easy';
let gameOver = false;
let ai = new MinimaxAI();

// Board rendering variables
let cellSize = 0;
let boardElement = null;

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    hideGameOverModal();
    showScreen('home-screen');
}

// Initialize board array
function createBoard() {
    board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = EMPTY;
        }
    }
}

// Render the game board
function renderBoard() {
    boardElement = document.getElementById('game-board');
    const container = document.getElementById('board-container');

    // Calculate cell size based on container
    const boardSize = container.clientWidth - 24; // Account for padding
    cellSize = boardSize / BOARD_SIZE;

    // Clear existing content
    boardElement.innerHTML = '';

    // Create SVG for grid lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'absolute inset-0 w-full h-full');
    svg.setAttribute('viewBox', `0 0 ${BOARD_SIZE * cellSize} ${BOARD_SIZE * cellSize}`);

    // Draw grid lines
    for (let i = 0; i < BOARD_SIZE; i++) {
        // Vertical lines
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', cellSize / 2 + i * cellSize);
        vLine.setAttribute('y1', cellSize / 2);
        vLine.setAttribute('x2', cellSize / 2 + i * cellSize);
        vLine.setAttribute('y2', cellSize / 2 + (BOARD_SIZE - 1) * cellSize);
        vLine.setAttribute('stroke', '#d4a574');
        vLine.setAttribute('stroke-width', '1');
        svg.appendChild(vLine);

        // Horizontal lines
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', cellSize / 2);
        hLine.setAttribute('y1', cellSize / 2 + i * cellSize);
        hLine.setAttribute('x2', cellSize / 2 + (BOARD_SIZE - 1) * cellSize);
        hLine.setAttribute('y2', cellSize / 2 + i * cellSize);
        hLine.setAttribute('stroke', '#d4a574');
        hLine.setAttribute('stroke-width', '1');
        svg.appendChild(hLine);
    }

    // Draw star points
    const starPoints = [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];
    for (const [row, col] of starPoints) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cellSize / 2 + col * cellSize);
        circle.setAttribute('cy', cellSize / 2 + row * cellSize);
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', '#c4956a');
        svg.appendChild(circle);
    }

    boardElement.appendChild(svg);

    // Create clickable cells
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell absolute cursor-pointer';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.left = `${j * cellSize}px`;
            cell.style.top = `${i * cellSize}px`;
            cell.dataset.row = i;
            cell.dataset.col = j;

            // Add hover preview
            const hoverPreview = document.createElement('div');
            hoverPreview.className = `cell-hover absolute rounded-full ${currentPlayer === 'B' ? 'stone-blueberry' : 'stone-strawberry'}`;
            hoverPreview.style.width = `${cellSize * 0.7}px`;
            hoverPreview.style.height = `${cellSize * 0.7}px`;
            hoverPreview.style.left = `${cellSize * 0.15}px`;
            hoverPreview.style.top = `${cellSize * 0.15}px`;
            cell.appendChild(hoverPreview);

            cell.addEventListener('click', () => handleCellClick(i, j));
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleCellClick(i, j);
            });

            boardElement.appendChild(cell);
        }
    }

    // Render existing stones
    renderStones();
}

// Render stones on the board
function renderStones() {
    // Remove existing stones
    document.querySelectorAll('.stone').forEach(s => s.remove());

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== EMPTY) {
                placeStoneVisual(i, j, board[i][j]);
            }
        }
    }
}

// Place a stone visually
function placeStoneVisual(row, col, player) {
    const stone = document.createElement('div');
    stone.className = `stone absolute rounded-full ${player === 'B' ? 'stone-blueberry' : 'stone-strawberry'}`;
    stone.style.width = `${cellSize * 0.7}px`;
    stone.style.height = `${cellSize * 0.7}px`;
    stone.style.left = `${col * cellSize + cellSize * 0.15}px`;
    stone.style.top = `${row * cellSize + cellSize * 0.15}px`;
    stone.style.zIndex = '10';
    stone.dataset.row = row;
    stone.dataset.col = col;

    boardElement.appendChild(stone);
}

// Handle cell click
function handleCellClick(row, col) {
    if (gameOver) return;
    if (gameMode === 'ai' && currentPlayer === 'W') return; // AI's turn

    if (isValidMove(row, col)) {
        makeMove(row, col, currentPlayer);
    }
}

// Check if move is valid
function isValidMove(row, col) {
    return row >= 0 && col >= 0 && row < BOARD_SIZE && col < BOARD_SIZE && board[row][col] === EMPTY;
}

// Make a move
function makeMove(row, col, player) {
    board[row][col] = player;
    placeStoneVisual(row, col, player);

    if (checkWin(row, col, player)) {
        gameOver = true;
        setTimeout(() => showGameOver(player), 300);
        return;
    }

    if (checkDraw()) {
        gameOver = true;
        setTimeout(() => showGameOver(null), 300);
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'B' ? 'W' : 'B';
    updatePlayerInfo();
    updateHoverColors();

    // AI move
    if (gameMode === 'ai' && currentPlayer === 'W' && !gameOver) {
        setTimeout(makeAIMove, 400);
    }
}

// Make AI move
function makeAIMove() {
    updatePlayerInfo('thinking');

    setTimeout(() => {
        const [row, col] = ai.bestMove(board, 'W', 'B');
        if (row >= 0 && col >= 0) {
            makeMove(row, col, 'W');
        }
    }, 300);
}

// Check win
function checkWin(row, col, symbol) {
    const dx = [1, 0, 1, 1];
    const dy = [0, 1, 1, -1];

    for (let loc = 0; loc < 4; loc++) {
        let count = 1;
        for (let dir = -1; dir <= 1; dir += 2) {
            let x = row, y = col;
            while (true) {
                x += dx[loc] * dir;
                y += dy[loc] * dir;
                if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE || board[x][y] !== symbol) break;
                count++;
            }
        }
        if (count >= 5) return true;
    }
    return false;
}

// Check draw
function checkDraw() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) return false;
        }
    }
    return true;
}

// Update player info display
function updatePlayerInfo(status) {
    const p1Info = document.getElementById('player1-info');
    const p2Info = document.getElementById('player2-info');
    const p1Status = document.getElementById('player1-status');
    const p2Status = document.getElementById('player2-status');

    if (currentPlayer === 'B') {
        p1Info.classList.remove('opacity-60');
        p2Info.classList.add('opacity-60');
        p1Status.textContent = 'Your Turn';
        p2Status.textContent = 'Waiting';
    } else {
        p1Info.classList.add('opacity-60');
        p2Info.classList.remove('opacity-60');
        p1Status.textContent = 'Waiting';
        if (status === 'thinking' && gameMode === 'ai') {
            p2Status.textContent = 'Thinking...';
        } else {
            p2Status.textContent = gameMode === 'ai' ? 'AI Turn' : 'Your Turn';
        }
    }
}

// Update hover preview colors
function updateHoverColors() {
    document.querySelectorAll('.cell-hover').forEach(hover => {
        hover.classList.remove('stone-blueberry', 'stone-strawberry');
        hover.classList.add(currentPlayer === 'B' ? 'stone-blueberry' : 'stone-strawberry');
    });
}

// Show game over modal
function showGameOver(winner) {
    const modal = document.getElementById('game-over-modal');
    const emoji = document.getElementById('winner-emoji');
    const text = document.getElementById('winner-text');
    const subtitle = document.getElementById('winner-subtitle');

    if (winner === null) {
        emoji.textContent = '🤝';
        text.textContent = "It's a Draw!";
        subtitle.textContent = 'Great minds think alike!';
    } else if (gameMode === 'ai') {
        if (winner === 'B') {
            emoji.textContent = '🎉';
            text.textContent = 'You Won!';
            subtitle.textContent = 'Amazing victory!';
        } else {
            emoji.textContent = '🤖';
            text.textContent = 'AI Won!';
            subtitle.textContent = 'Better luck next time!';
        }
    } else {
        emoji.textContent = '🏆';
        text.textContent = `${winner === 'B' ? 'Blueberry' : 'Strawberry'} Won!`;
        subtitle.textContent = 'What an exciting game!';
    }

    modal.classList.remove('hidden');
}

// Hide game over modal
function hideGameOverModal() {
    document.getElementById('game-over-modal').classList.add('hidden');
}

// Start two player game
function startTwoPlayer() {
    gameMode = 'two-player';
    gameOver = false;
    currentPlayer = 'B';

    // Update names
    document.getElementById('player1-name').textContent = 'Blueberry';
    document.getElementById('player2-name').textContent = 'Strawberry';

    createBoard();
    showScreen('game-screen');

    setTimeout(() => {
        renderBoard();
        updatePlayerInfo();
    }, 100);
}

// Start AI game
function startAIGame() {
    // Get selected difficulty
    const form = document.getElementById('difficulty-form');
    const selected = form.querySelector('input[name="difficulty"]:checked');
    difficulty = selected ? selected.value : 'easy';

    // Set AI difficulty
    ai.setDifficulty(difficulty);

    gameMode = 'ai';
    gameOver = false;
    currentPlayer = 'B';

    // Update names based on difficulty
    const aiNames = {
        'easy': '🦥 Sleepy Sloth',
        'medium': '🦊 Curious Fox',
        'hard': '🐉 Wise Dragon'
    };

    document.getElementById('player1-name').textContent = 'You';
    document.getElementById('player2-name').textContent = aiNames[difficulty] || 'AI';

    createBoard();
    showScreen('game-screen');

    setTimeout(() => {
        renderBoard();
        updatePlayerInfo();
    }, 100);
}

// Restart game
function restartGame() {
    hideGameOverModal();
    gameOver = false;
    currentPlayer = 'B';
    createBoard();
    renderBoard();
    updatePlayerInfo();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (document.getElementById('game-screen').classList.contains('active')) {
        renderBoard();
    }
});

// Minimax AI for Gomoku - With difficulty levels
const EMPTY = '_';
const BOARD_SIZE = 9;

class MinimaxAI {
    constructor() {
        this.center = Math.floor(BOARD_SIZE / 2);
        this.difficulty = 'easy';
        this.searchDepth = 1;
        this.randomness = 0.3; // Chance to make suboptimal move
    }

    setDifficulty(level) {
        this.difficulty = level;
        switch (level) {
            case 'easy':
                this.searchDepth = 1;
                this.randomness = 0.4; // 40% chance of random move
                break;
            case 'medium':
                this.searchDepth = 2;
                this.randomness = 0.15; // 15% chance of random move
                break;
            case 'hard':
                this.searchDepth = 3;
                this.randomness = 0; // Always optimal
                break;
            default:
                this.searchDepth = 2;
                this.randomness = 0.2;
        }
    }

    bestMove(board, ai, player) {
        // On easy mode, sometimes make a random move
        if (this.difficulty === 'easy' && Math.random() < this.randomness) {
            const randomMove = this.getRandomMove(board);
            if (randomMove) return randomMove;
        }

        // First: try to win immediately (all difficulties do this)
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    board[i][j] = ai;
                    if (this.checkWinAt(board, i, j, ai)) {
                        board[i][j] = EMPTY;
                        return [i, j];
                    }
                    board[i][j] = EMPTY;
                }
            }
        }

        // Second: block player's winning move (all difficulties do this)
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    board[i][j] = player;
                    if (this.checkWinAt(board, i, j, player)) {
                        board[i][j] = EMPTY;
                        return [i, j];
                    }
                    board[i][j] = EMPTY;
                }
            }
        }

        // Medium/Hard: check for urgent threats
        if (this.difficulty !== 'easy') {
            let urgentMove = this.findUrgentMove(board, ai, player);
            if (urgentMove) {
                return urgentMove;
            }
        }

        // Use minimax for strategic positioning
        let bestScore = -Infinity;
        let bestMoves = [];

        // Only consider moves near existing pieces
        let candidates = this.getCandidateMoves(board);

        // On easy, limit candidates for faster but worse play
        if (this.difficulty === 'easy' && candidates.length > 10) {
            candidates = candidates.slice(0, 10);
        }

        for (const [i, j] of candidates) {
            board[i][j] = ai;
            let score = this.minimax(board, this.searchDepth, false, ai, player, -Infinity, Infinity);
            board[i][j] = EMPTY;

            // Add some randomness for non-hard difficulties
            if (this.difficulty !== 'hard' && Math.random() < this.randomness) {
                score += (Math.random() - 0.5) * 50;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [[i, j]];
            } else if (score === bestScore) {
                bestMoves.push([i, j]);
            }
        }

        // If multiple moves have the same score, prefer center positions
        if (bestMoves.length > 1) {
            bestMoves.sort((a, b) => {
                const distA = Math.abs(a[0] - this.center) + Math.abs(a[1] - this.center);
                const distB = Math.abs(b[0] - this.center) + Math.abs(b[1] - this.center);
                return distA - distB;
            });
        }

        return bestMoves.length > 0 ? bestMoves[0] : [this.center, this.center];
    }

    // Get a random valid move
    getRandomMove(board) {
        const candidates = this.getCandidateMoves(board);
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Get candidate moves (cells near existing pieces)
    getCandidateMoves(board) {
        let candidates = new Set();
        let hasAnyPiece = false;

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] !== EMPTY) {
                    hasAnyPiece = true;
                    const range = this.difficulty === 'hard' ? 2 : 1;
                    for (let di = -range; di <= range; di++) {
                        for (let dj = -range; dj <= range; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] === EMPTY) {
                                candidates.add(`${ni},${nj}`);
                            }
                        }
                    }
                }
            }
        }

        if (!hasAnyPiece) {
            return [[this.center, this.center]];
        }

        return Array.from(candidates).map(s => s.split(',').map(Number));
    }

    // Find urgent moves (must block or must attack)
    findUrgentMove(board, ai, player) {
        // Check if AI can make 4 in a row
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    board[i][j] = ai;
                    if (this.countMaxLine(board, i, j, ai) >= 4) {
                        board[i][j] = EMPTY;
                        return [i, j];
                    }
                    board[i][j] = EMPTY;
                }
            }
        }

        // Check if player can make 4 in a row (must block)
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    board[i][j] = player;
                    if (this.countMaxLine(board, i, j, player) >= 4) {
                        board[i][j] = EMPTY;
                        return [i, j];
                    }
                    board[i][j] = EMPTY;
                }
            }
        }

        return null;
    }

    minimax(board, depth, isMaximizing, ai, player, alpha, beta) {
        if (this.checkFullBoardWin(board, ai)) return 100000;
        if (this.checkFullBoardWin(board, player)) return -100000;
        if (depth === 0) return this.evaluateBoard(board, ai, player);

        let candidates = this.getCandidateMoves(board);
        if (candidates.length === 0) return 0;

        // Limit candidates for performance
        if (candidates.length > 15) {
            candidates = candidates.slice(0, 15);
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (const [i, j] of candidates) {
                board[i][j] = ai;
                let score = this.minimax(board, depth - 1, false, ai, player, alpha, beta);
                board[i][j] = EMPTY;
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (const [i, j] of candidates) {
                board[i][j] = player;
                let score = this.minimax(board, depth - 1, true, ai, player, alpha, beta);
                board[i][j] = EMPTY;
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return bestScore;
        }
    }

    checkFullBoardWin(board, symbol) {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === symbol && this.checkWinAt(board, i, j, symbol)) {
                    return true;
                }
            }
        }
        return false;
    }

    checkWinAt(board, row, col, symbol) {
        return this.countMaxLine(board, row, col, symbol) >= 5;
    }

    countMaxLine(board, row, col, symbol) {
        const dx = [1, 0, 1, 1];
        const dy = [0, 1, 1, -1];
        let maxCount = 0;

        for (let dir = 0; dir < 4; dir++) {
            let count = 1;
            let x = row + dx[dir];
            let y = col + dy[dir];
            while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === symbol) {
                count++;
                x += dx[dir];
                y += dy[dir];
            }
            x = row - dx[dir];
            y = col - dy[dir];
            while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === symbol) {
                count++;
                x -= dx[dir];
                y -= dy[dir];
            }
            maxCount = Math.max(maxCount, count);
        }
        return maxCount;
    }

    evaluateBoard(board, ai, player) {
        let score = 0;
        score += this.evaluateLines(board, ai, player);
        score += this.evaluatePosition(board, ai, player);
        return score;
    }

    evaluateLines(board, ai, player) {
        let score = 0;
        const dx = [1, 0, 1, 1];
        const dy = [0, 1, 1, -1];

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                for (let dir = 0; dir < 4; dir++) {
                    const endI = i + dx[dir] * 4;
                    const endJ = j + dy[dir] * 4;
                    if (endI < 0 || endI >= BOARD_SIZE || endJ < 0 || endJ >= BOARD_SIZE) continue;

                    let aiCount = 0;
                    let playerCount = 0;

                    for (let k = 0; k < 5; k++) {
                        const ci = i + dx[dir] * k;
                        const cj = j + dy[dir] * k;
                        if (board[ci][cj] === ai) aiCount++;
                        else if (board[ci][cj] === player) playerCount++;
                    }

                    if (playerCount === 0 && aiCount > 0) {
                        score += this.getLineScore(aiCount);
                    } else if (aiCount === 0 && playerCount > 0) {
                        score -= this.getLineScore(playerCount);
                    }
                }
            }
        }

        return score;
    }

    getLineScore(count) {
        switch (count) {
            case 1: return 1;
            case 2: return 10;
            case 3: return 100;
            case 4: return 1000;
            case 5: return 10000;
            default: return 0;
        }
    }

    evaluatePosition(board, ai, player) {
        let score = 0;

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) continue;

                const distFromCenter = Math.abs(i - this.center) + Math.abs(j - this.center);
                const positionBonus = (BOARD_SIZE - distFromCenter) * 2;

                if (board[i][j] === ai) {
                    score += positionBonus;
                } else {
                    score -= positionBonus;
                }
            }
        }

        return score;
    }
}

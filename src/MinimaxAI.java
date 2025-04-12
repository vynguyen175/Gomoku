public class MinimaxAI {
    private final char emptyMove = '_';

    public int[] bestMove(char[][] board, char ai, char player) {
        // First: try to win immediately
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == emptyMove) {
                    board[i][j] = ai;
                    if (checkFullBoardWin(board, ai)) {
                        board[i][j] = emptyMove;
                        return new int[]{i, j};
                    }
                    board[i][j] = emptyMove;
                }
            }
        }

        // Second: block player's winning move
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == emptyMove) {
                    board[i][j] = player;
                    if (checkFullBoardWin(board, player)) {
                        board[i][j] = emptyMove;
                        return new int[]{i, j}; // Block player
                    }
                    board[i][j] = emptyMove;
                }
            }
        }

        int bestScore = Integer.MIN_VALUE;
        int[] bestMove = {-1, -1};

        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == emptyMove) {
                    board[i][j] = ai;
                    int score = minimax(board, 2, false, ai, player);
                    board[i][j] = emptyMove;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove[0] = i;
                        bestMove[1] = j;
                    }
                }
            }
        }
        return bestMove;
    }

    private int minimax(char[][] board, int depth, boolean isMaximizing, char ai, char player) {
        if (checkFullBoardWin(board, ai)) return 10000;
        if (checkFullBoardWin(board, player)) return -10000;
        if (depth == 0) return evaluateBoard(board, ai, player);

        if (isMaximizing) {
            int bestScore = Integer.MIN_VALUE;
            for (int i = 0; i < board.length; i++) {
                for (int j = 0; j < 9; j++) {
                    if (board[i][j] == emptyMove) {
                        board[i][j] = ai;
                        int score = minimax(board, depth - 1, false, ai, player);
                        board[i][j] = emptyMove;
                        bestScore = Math.max(bestScore, score);
                    }
                }
            }
            return bestScore;
        } else {
            int bestScore = Integer.MAX_VALUE;
            for (int i = 0; i < board.length; i++) {
                for (int j = 0; j < 9; j++) {
                    if (board[i][j] == emptyMove) {
                        board[i][j] = player;
                        int score = minimax(board, depth - 1, true, ai, player);
                        board[i][j] = emptyMove;
                        bestScore = Math.min(bestScore, score);
                    }
                }
            }
            return bestScore;
        }
    }

    private boolean checkFullBoardWin(char[][] board, char symbol) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (checkWin(board, i, j, symbol)) return true;
            }
        }
        return false;
    }

    private boolean checkWin(char[][] board, int row, int col, char symbol) {
        int[] dx = {1, 0, 1, 1};
        int[] dy = {0, 1, 1, -1};
        for (int loc = 0; loc < 4; loc++) {
            int count = 1;
            for (int dir = -1; dir <= 1; dir += 2) {
                int x = row + dx[loc] * dir;
                int y = col + dy[loc] * dir;
                while (x >= 0 && x < 9 && y >= 0 && y < 9 && board[x][y] == symbol) {
                    count++;
                    x += dx[loc] * dir;
                    y += dy[loc] * dir;
                }
            }
            if (count >= 5) return true;
        }
        return false;
    }

    private int evaluateBoard(char[][] board, char ai, char player) {
        int score = 0;
        int[] dx = {1, 0, 1, 1};
        int[] dy = {0, 1, 1, -1};

        for (int row = 0; row < 9; row++) {
            for (int col = 0; col < 9; col++) {
                if (board[row][col] == emptyMove) continue;
                char current = board[row][col];
                for (int dir = 0; dir < 4; dir++) {
                    int count = 1;
                    for (int direction = -1; direction <= 1; direction += 2) {
                        int x = row + dx[dir] * direction;
                        int y = col + dy[dir] * direction;
                        while (x >= 0 && x < 9 && y >= 0 && y < 9 && board[x][y] == current) {
                            count++;
                            x += dx[dir] * direction;
                            y += dy[dir] * direction;
                        }
                    }
                    int lineScore = switch (count - 1) {
                        case 2 -> 10;
                        case 3 -> 100;
                        case 4 -> 1000;
                        default -> 0;
                    };
                    if (current == ai) score += lineScore;
                    else if (current == player) score -= lineScore;
                }
            }
        }
        return score;
    }
}
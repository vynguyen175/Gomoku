import java.util.Scanner;

public class GomokuGame {
    private final char emptyMove = '_';
    private char[][] board;
    private Scanner scanner = new Scanner(System.in);

    public GomokuGame() {
        board = new char[9][9];
        for (int i = 0; i < 9; i++){
            for (int j = 0; j < 9; j++){
                board[i][j] = emptyMove;
            }
        }
    }

    public void displayBoard(){
        System.out.print("  ");
        for (int c = 0; c < 9; c++) System.out.print(c + " ");
        System.out.println();
        for (int i = 0; i < 9; i++) {
            System.out.print(i + " ");
            for (int j = 0; j < 9; j++) {
                System.out.print(board[i][j] + " ");
            }
            System.out.println();
        }
    }

    public boolean isValidMove(int row, int col){
        return row >=0 && col >=0 && row < 9 && col < 9 && board[row][col] == emptyMove;
    }

    public boolean move(int row, int col, char symbol){
        if (isValidMove(row, col)){
            board[row][col] = symbol;
            return true;
        }
        return false;
    }

    public boolean win(int row, int col, char symbol){
        int[] dx = {1,0,1,1};
        int[] dy = {0,1,1,-1};
        for (int loc = 0; loc < 4; loc++){
            int count=1;
            for (int dir =-1; dir<=1;dir+=2){
                int x = row, y=col;
                while (true){
                    x+=dx[loc]*dir;
                    y+=dy[loc]*dir;
                    if (x<0 || y<0 || x>=9 || y>=9 || board[x][y]!=symbol) break;
                    count++;
                }
            }
            if (count>=5) return true;
        }
        return false;
    }

    public boolean draw(){
        for (int i=0;i<9;i++){
            for (int j=0;j<9;j++){
                if (board[i][j]==emptyMove){
                    return false;
                }
            }
        }
        return true;
    }

    public void twoPlayers(){
        char currentPlayer='B';
        while (true){
            displayBoard();

            int row = -1, col = -1;
            boolean valid = false;
            while (!valid) {
                System.out.printf("Player %c, enter move (row and column):  ", currentPlayer);
                String input = scanner.nextLine().trim();
                String[] parts = input.split("\\s+");
                if (parts.length != 2) {
                    System.out.println("❌ Please enter exactly two numbers.");
                    continue;
                }
                try {
                    row = Integer.parseInt(parts[0]);
                    col = Integer.parseInt(parts[1]);
                    if (isValidMove(row, col)) {
                        valid = move(row, col, currentPlayer);
                    } else {
                        System.out.println("❌ Invalid move. Try again.");
                    }
                } catch (NumberFormatException e) {
                    System.out.println("❌ Please enter valid numbers.");
                }
            }

            if (win(row, col, currentPlayer)){
                displayBoard();
                System.out.printf("Player %c won\n", currentPlayer);
                break;
            }
            if (draw()){
                displayBoard();
                System.out.println("Draw.");
                break;
            }

            currentPlayer = (currentPlayer == 'B') ? 'W' : 'B';
        }
    }

    public void playerVsAI(){
        MinimaxAI ai = new MinimaxAI();
        char player = 'B', computer = 'W';
        boolean symbolChosen = false;

        while (!symbolChosen) {
            System.out.print("Choose your symbol black or white (B/W): ");
            String input = scanner.nextLine().toUpperCase().trim();
            if (input.length() == 1 && (input.charAt(0) == 'B' || input.charAt(0) == 'W')) {
                player = input.charAt(0);
                computer = (player == 'B') ? 'W' : 'B';
                symbolChosen = true;
            } else {
                System.out.println("❌ Invalid symbol. Please enter 'B' or 'W'.");
            }
        }

        char currentPlayer = 'B';

        if (player == 'W') {
            System.out.println("AI is thinking...");
            int[] aiMove = ai.bestMove(board, computer, player);
            move(aiMove[0], aiMove[1], computer);
            System.out.printf("Computer placed at (%d, %d)\n", aiMove[0], aiMove[1]);
            currentPlayer = 'W';
        }

        while (true){
            displayBoard();
            if (currentPlayer == player){
                int row = -1, col = -1;
                boolean valid = false;
                while (!valid) {
                    System.out.print("Your turn (row and column): ");
                    String input = scanner.nextLine().trim();
                    String[] parts = input.split("\\s+");
                    if (parts.length != 2) {
                        System.out.println("❌ Please enter exactly two numbers.");
                        continue;
                    }
                    try {
                        row = Integer.parseInt(parts[0]);
                        col = Integer.parseInt(parts[1]);
                        if (isValidMove(row, col)) {
                            valid = move(row, col, player);
                        } else {
                            System.out.println("❌ Invalid move. Try again.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("❌ Please enter valid numbers.");
                    }
                }

                if (win(row, col, player)){
                    displayBoard();
                    System.out.println("You won");
                    break;
                }
            } else {
                System.out.println("AI is thinking...");
                int[] aiMove = ai.bestMove(board, computer, player);
                move(aiMove[0], aiMove[1], computer);
                System.out.printf("Computer placed at (%d, %d)\n", aiMove[0], aiMove[1]);
                if (win(aiMove[0], aiMove[1], computer)){
                    displayBoard();
                    System.out.println("Computer won");
                    break;
                }
            }

            if (draw()){
                displayBoard();
                System.out.println("Draw.");
                break;
            }
            currentPlayer = (currentPlayer == 'B') ? 'W' : 'B';
        }
    }
}

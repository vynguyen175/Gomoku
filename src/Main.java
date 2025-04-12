import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Gomoku game = new Gomoku();

        System.out.println("Welcome to Vy's Gomoku game 🎮");
        int userChoice = 0;

        // Keep prompting until user enters 1 or 2
        while (userChoice != 1 && userChoice != 2) {
            System.out.println("Choose your game mode:");
            System.out.println("1. 2 Players");
            System.out.println("2. Player vs. Computer");
            System.out.print("Enter your choice (1 or 2): ");

            if (scanner.hasNextInt()) {
                userChoice = scanner.nextInt();
                scanner.nextLine(); // consume newline
                if (userChoice != 1 && userChoice != 2) {
                    System.out.println("❌ Invalid option. Try again.");
                }
            } else {
                System.out.println("❌ Invalid input. Please enter a number.");
                scanner.nextLine(); // consume invalid input
            }
        }

        if (userChoice == 1) {
            game.twoPlayers();
        } else {
            game.playerVsAI();
        }

        scanner.close();
    }
}

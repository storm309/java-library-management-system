import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        LibraryController controller = new LibraryController();
        Scanner sc = new Scanner(System.in);

        while (true) {
            System.out.println("\n===== Library Menu =====");
            System.out.println("1. Add Book");
            System.out.println("2. Remove Book");
            System.out.println("3. Search Book");
            System.out.println("4. Display Books");
            System.out.println("5. Return Book");
            System.out.println("6. Borrow Book");
            System.out.println("7. Exit");
            System.out.print("Enter your choice: ");

            int choice = 0;
            try {
                choice = sc.nextInt();
                sc.nextLine(); 
            } catch (Exception e) {
                System.out.println("Invalid input! Please enter a number.");
                sc.nextLine(); 
                continue;
            }

            switch (choice) {

                case 1:
                    System.out.print("Enter ID: ");
                    int id = sc.nextInt();
                    sc.nextLine();
                    System.out.print("Enter Name: ");
                    String name = sc.nextLine();
                    System.out.print("Enter Author: ");
                    String author = sc.nextLine();
                    controller.addBook(new Book(id, name, author));
                    break;

                case 2:
                    System.out.print("Enter ID to remove: ");
                    controller.removeBook(sc.nextInt());
                    break;

                case 3:
                    System.out.print("Enter ID to search: ");
                    controller.searchBook(sc.nextInt());
                    break;

                case 4:
                    controller.displayAllBooks();
                    break;

                case 5:
                    System.out.print("Enter ID to return: ");
                    controller.returnBook(sc.nextInt());
                    break;

                case 6:
                    System.out.print("Enter ID to borrow: ");
                    controller.borrowBook(sc.nextInt());
                    break;

                case 7:
                    System.out.println("Exiting...");
                    sc.close();
                    return;

                default:
                    System.out.println("Invalid choice!");
            }
        }
    }
}
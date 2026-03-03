import java.util.ArrayList;

public class LibraryController {

    private ArrayList<Book> books = new ArrayList<>();

    // Add Book
    public void addBook(Book book) {
        books.add(book);
        System.out.println("Book added successfully!");
    }

    // Remove Book
    public void removeBook(int id) {
        books.removeIf(book -> book.getId() == id);
        System.out.println("Book removed successfully!");
    }

    // Search Book
    public void searchBook(int id) {
        for (Book book : books) {
            if (book.getId() == id) {
                System.out.println(book);
                return;
            }
        }
        System.out.println("Book not found!");
    }

    // Display All Books
    public void displayAllBooks() {
        if (books.isEmpty()) {
            System.out.println("No books available.");
            return;
        }
        for (Book book : books) {
            System.out.println(book);
        }
    }

    // Borrow Book
    public void borrowBook(int id) {
        for (Book book : books) {
            if (book.getId() == id && book.isAvailable()) {
                book.setAvailable(false);
                System.out.println("Book borrowed successfully!");
                return;
            }
        }
        System.out.println("Book not available!");
    }

    // Return Book
    public void returnBook(int id) {
        for (Book book : books) {
            if (book.getId() == id && !book.isAvailable()) {
                book.setAvailable(true);
                System.out.println("Book returned successfully!");
                return;
            }
        }
        System.out.println("Invalid return!");
    }
}
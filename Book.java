public class Book {
    private int id;
    private String name;
    private String author;
    private boolean isAvailable;

    public Book(int id, String name, String author) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.isAvailable = true; // default
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAuthor() {
        return author;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean status) {
        this.isAvailable = status;
    }

    @Override
    public String toString() {
        return id + " | " + name + " | " + author + 
               " | " + (isAvailable ? "Available" : "Borrowed");
    }
}
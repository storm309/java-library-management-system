package com.library.service;

import com.library.dto.BookRequest;
import com.library.entity.Author;
import com.library.entity.Book;
import com.library.entity.Category;
import com.library.entity.User;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    /** Add a new book linked to an existing author and existing categories */
    public Book createBook(BookRequest request) {
        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Author not found with id: " + request.getAuthorId()));

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(author);
        book.setCategories(categories);

        return bookRepository.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Book not found with id: " + id));
    }

    /** Borrow: assign book to a user */
    public Book borrowBook(Long bookId, Long userId) {
        Book book = getBookById(bookId);
        if (!book.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Book is already borrowed by user id: " + book.getBorrowedByUserId());
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found with id: " + userId));
        book.setBorrowedBy(user);
        return bookRepository.save(book);
    }

    /** Bonus: return a borrowed book */
    public Book returnBook(Long bookId) {
        Book book = getBookById(bookId);
        if (book.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book is not currently borrowed");
        }
        book.setBorrowedBy(null);
        return bookRepository.save(book);
    }
}

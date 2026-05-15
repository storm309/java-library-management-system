package com.library.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.library.dto.BookRequest;
import com.library.entity.Book;
import com.library.service.BookService;
import com.library.service.UserService;

@RestController
@RequestMapping("/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private UserService userService;

    // POST /books  — Add new book (pass authorId + categoryIds in body)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book createBook(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody BookRequest request) {
        userService.requireAdmin(userId);
        return bookService.createBook(request);
    }

    // GET /books  — Fetch all books
    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    // GET /books/{id}  — Fetch single book
    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    // PUT /books/{id}/borrow/{userId}  — Assign book to user (borrow)
    @PutMapping("/{id}/borrow/{userId}")
    public Book borrowBook(@PathVariable Long id, @PathVariable Long userId) {
        return bookService.borrowBook(id, userId);
    }

    // PUT /books/{id}/return  — (Bonus) Mark book as returned
    @PutMapping("/{id}/return")
    public Book returnBook(@PathVariable Long id) {
        return bookService.returnBook(id);
    }
}

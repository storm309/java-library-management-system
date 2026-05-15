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

import com.library.entity.Author;
import com.library.entity.Book;
import com.library.service.AuthorService;
import com.library.service.UserService;

@RestController
@RequestMapping("/authors")
public class AuthorController {

    @Autowired
    private AuthorService authorService;

    @Autowired
    private UserService userService;

    // POST /authors  — Add new author
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Author createAuthor(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody Author author) {
        userService.requireAdmin(userId);
        return authorService.createAuthor(author);
    }

    // GET /authors  — Fetch all authors
    @GetMapping
    public List<Author> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    // GET /authors/{id}  — Fetch single author
    @GetMapping("/{id}")
    public Author getAuthorById(@PathVariable Long id) {
        return authorService.getAuthorById(id);
    }

    // GET /authors/{id}/books  — Fetch all books by this author
    @GetMapping("/{id}/books")
    public List<Book> getAuthorBooks(@PathVariable Long id) {
        return authorService.getAuthorBooks(id);
    }

    // PUT /authors/{id}  — Update author name and bio
    @PutMapping("/{id}")
    public Author updateAuthor(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody Author author) {
        userService.requireAdmin(userId);
        return authorService.updateAuthor(id, author);
    }
}

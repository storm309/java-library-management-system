package com.library.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.library.entity.Author;
import com.library.entity.Book;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;

@Service
public class AuthorService {

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private BookRepository bookRepository;

    public Author createAuthor(Author author) {
        return authorRepository.save(author);
    }

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public Author getAuthorById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Author not found with id: " + id));
    }

    /** Fetch all books written by this author */
    public List<Book> getAuthorBooks(Long id) {
        Author author = getAuthorById(id);
        return bookRepository.findByAuthor(author);
    }

    /** Update author name and bio */
    public Author updateAuthor(Long id, Author details) {
        Author author = getAuthorById(id);
        author.setName(details.getName());
        author.setBio(details.getBio());
        return authorRepository.save(author);
    }
}

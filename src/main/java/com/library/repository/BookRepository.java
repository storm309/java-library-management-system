package com.library.repository;

import com.library.entity.Author;
import com.library.entity.Book;
import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Used by UserService to fetch a user's borrowed books
    List<Book> findByBorrowedBy(User user);

    // Used by AuthorService to fetch an author's books
    List<Book> findByAuthor(Author author);
}

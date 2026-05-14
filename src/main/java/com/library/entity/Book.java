package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a book in the library.
 * Relationships:
 *   - Many-to-One  → Author   (owns FK: author_id)
 *   - Many-to-Many ↔ Category (owns join table: book_category)
 *   - Many-to-One  → User     (owns FK: borrowed_by_user_id)
 */
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // ── Many-to-One with Author ──────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id")
    private Author author;

    // ── Many-to-Many with Category (owning side) ─────────────────────────────
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "book_category",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();

    // ── Many-to-One with User (borrow tracking) ──────────────────────────────
    // @JsonIgnore breaks cycle: User.borrowedBooks is already @JsonIgnored,
    // but keeping this hidden keeps GET /books clean too.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "borrowed_by_user_id")
    @JsonIgnore
    private User borrowedBy;

    public Book() {}

    // Computed availability — serialised as "available": true/false
    public boolean isAvailable() {
        return borrowedBy == null;
    }

    // Expose borrower's id without circular reference
    public Long getBorrowedByUserId() {
        return borrowedBy != null ? borrowedBy.getId() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Author getAuthor() { return author; }
    public void setAuthor(Author author) { this.author = author; }

    public List<Category> getCategories() { return categories; }
    public void setCategories(List<Category> categories) { this.categories = categories; }

    public User getBorrowedBy() { return borrowedBy; }
    public void setBorrowedBy(User borrowedBy) { this.borrowedBy = borrowedBy; }
}

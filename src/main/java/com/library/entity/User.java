package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a library user.
 * Relationships:
 *   - One-to-One  → Profile  (owns the FK: profile_id)
 *   - One-to-Many → Book     (borrowedBy mapping)
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String username;

    // ── One-to-One with Profile ──────────────────────────────────────────────
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    // ── One-to-Many with Book (borrowed books) ───────────────────────────────
    // @JsonIgnore breaks the cycle: User → borrowedBooks → Book → borrowedBy → User
    @OneToMany(mappedBy = "borrowedBy", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Book> borrowedBooks = new ArrayList<>();

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }

    public List<Book> getBorrowedBooks() { return borrowedBooks; }
    public void setBorrowedBooks(List<Book> borrowedBooks) { this.borrowedBooks = borrowedBooks; }
}

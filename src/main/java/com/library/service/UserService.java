package com.library.service;

import com.library.entity.Book;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    /** Create a user; profile is nested in request body and saved via CascadeType.ALL */
    public User createUser(User user) {
        // Keep bidirectional consistency on the Java object graph
        if (user.getProfile() != null) {
            user.getProfile().setUser(user);
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
    }

    /** Bonus: update name, username, and profile fields */
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setUsername(userDetails.getUsername());
        if (userDetails.getProfile() != null && user.getProfile() != null) {
            user.getProfile().setEmail(userDetails.getProfile().getEmail());
            user.getProfile().setPhone(userDetails.getProfile().getPhone());
            user.getProfile().setAddress(userDetails.getProfile().getAddress());
        }
        return userRepository.save(user);
    }

    /** Bonus: delete a user */
    public void deleteUser(Long id) {
        getUserById(id); // throws 404 if missing
        userRepository.deleteById(id);
    }

    /** Returns all books currently borrowed by this user */
    public List<Book> getUserBooks(Long id) {
        User user = getUserById(id);
        return bookRepository.findByBorrowedBy(user);
    }
}

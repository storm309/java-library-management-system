package com.library.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.library.dto.AuthRequest;
import com.library.dto.AuthResponse;
import com.library.entity.Book;
import com.library.entity.Profile;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.UserRepository;

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

    /** Register a new user with profile — used by /auth/register */
    public AuthResponse register(AuthRequest req) {
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (req.getEmail() != null && !req.getEmail().isEmpty() &&
                userRepository.findByProfile_EmailIgnoreCase(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User();
        user.setName(req.getName());
        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());

        Profile profile = new Profile();
        profile.setEmail(req.getEmail());
        profile.setPhone(req.getPhone());
        profile.setAddress(req.getAddress());
        profile.setUser(user);
        user.setProfile(profile);

        User saved = userRepository.save(user);
        String email = saved.getProfile() != null ? saved.getProfile().getEmail() : null;
        return new AuthResponse(saved.getId(), saved.getName(), saved.getUsername(), email, "Registration successful");
    }

    /** Validate credentials — login by username OR email */
    public AuthResponse login(AuthRequest req) {
        String identifier = req.getUsername() != null ? req.getUsername().trim() : null;
        User user;
        if (identifier != null && identifier.contains("@")) {
            user = userRepository.findByProfile_EmailIgnoreCase(identifier)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        } else {
            user = userRepository.findByUsername(identifier)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        }
        if (!req.getPassword().equals(user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        String email = user.getProfile() != null ? user.getProfile().getEmail() : null;
        return new AuthResponse(user.getId(), user.getName(), user.getUsername(), email, "Login successful");
    }

    /** Update own profile (name, email, phone, address, optional password) */
    public AuthResponse updateProfile(Long id, AuthRequest req) {
        User user = getUserById(id);
        if (req.getName() != null && !req.getName().isEmpty()) {
            user.setName(req.getName());
        }
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            user.setPassword(req.getPassword());
        }
        if (user.getProfile() == null) {
            Profile profile = new Profile();
            profile.setUser(user);
            user.setProfile(profile);
        }
        if (req.getEmail() != null) user.getProfile().setEmail(req.getEmail());
        if (req.getPhone() != null) user.getProfile().setPhone(req.getPhone());
        if (req.getAddress() != null) user.getProfile().setAddress(req.getAddress());
        User saved = userRepository.save(user);
        String email = saved.getProfile() != null ? saved.getProfile().getEmail() : null;
        return new AuthResponse(saved.getId(), saved.getName(), saved.getUsername(), email, "Profile updated successfully");
    }
}

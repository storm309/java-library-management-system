package com.library.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.library.dto.AuthRequest;
import com.library.dto.AuthResponse;
import com.library.entity.Book;
import com.library.entity.User;
import com.library.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // POST /users  — Create user with nested profile
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // GET /users  — Fetch all users
    @GetMapping
    public List<User> getAllUsers(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        userService.requireAdmin(userId);
        return userService.getAllUsers();
    }

    // GET /users/{id}  — Fetch single user
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // PUT /users/{id}  — (Bonus) Update user & profile
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    // DELETE /users/{id}  — (Bonus) Delete user
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        userService.requireAdmin(userId);
        userService.deleteUser(id);
    }

    // GET /users/{id}/books  — Books currently borrowed by this user
    @GetMapping("/{id}/books")
    public List<Book> getUserBooks(@PathVariable Long id) {
        return userService.getUserBooks(id);
    }

    // PUT /users/{id}/profile  — Update own profile (name, email, phone, address, password)
    @PutMapping("/{id}/profile")
    public AuthResponse updateProfile(@PathVariable Long id, @RequestBody AuthRequest req) {
        return userService.updateProfile(id, req);
    }
}

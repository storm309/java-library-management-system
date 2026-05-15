package com.library.controller;

import com.library.dto.AuthRequest;
import com.library.dto.AuthResponse;
import com.library.entity.Book;
import com.library.entity.User;
import com.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public List<User> getAllUsers() {
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
    public void deleteUser(@PathVariable Long id) {
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

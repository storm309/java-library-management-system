package com.library.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.library.entity.Category;
import com.library.service.CategoryService;
import com.library.service.UserService;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    // POST /categories  — Add new category
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category createCategory(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody Category category) {
        userService.requireAdmin(userId);
        return categoryService.createCategory(category);
    }

    // GET /categories  — Fetch all categories
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }
}

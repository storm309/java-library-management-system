package com.library.dto;

import java.util.List;

/**
 * Request body for creating a Book.
 * Client sends authorId and categoryIds instead of nested objects.
 */
public class BookRequest {

    private String title;
    private Long authorId;
    private List<Long> categoryIds;

    public BookRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public List<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; }
}

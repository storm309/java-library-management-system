package com.library.dto;

public class AuthResponse {
    private Long id;
    private String name;
    private String username;
    private String message;

    public AuthResponse() {}

    public AuthResponse(Long id, String name, String username, String message) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

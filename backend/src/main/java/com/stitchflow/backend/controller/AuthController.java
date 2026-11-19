
package com.stitchflow.backend.controller;

import com.stitchflow.backend.model.AppUser;
import com.stitchflow.backend.model.Role;
import com.stitchflow.backend.repository.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Registration request data
    public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72,
              message = "Password must be 8 to 72 characters")
        String password
    ) {}

    // Information returned to the frontend
    public record RegisterResponse(
        Long id,
        String fullName,
        String email,
        Role role
    ) {}

    // CUSTOMER REGISTRATION
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        String fullName = request.fullName().trim();

        // Check if email already exists
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        // Create new customer
        AppUser user = new AppUser();

        user.setFullName(fullName);
        user.setEmail(email);

        // Encrypt password using BCrypt hashing
        user.setPasswordHash(
            passwordEncoder.encode(request.password())
        );

        // Public registrations are CUSTOMER only
        user.setRole(Role.CUSTOMER);

        // Save user to Supabase database
        try {
            AppUser saved = userRepository.saveAndFlush(user);

            return new RegisterResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole()
            );

        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Account could not be created; email may already exist"
            );
        }
    }

    // GET CURRENT LOGGED-IN USER
    @GetMapping("/me")
    public RegisterResponse currentUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please log in first"
            );
        }

        AppUser user = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                    )
                );

        return new RegisterResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole()
        );
    }
}

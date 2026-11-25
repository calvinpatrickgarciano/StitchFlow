
package com.stitchflow.backend.controller;

import com.stitchflow.backend.model.AppUser;
import com.stitchflow.backend.model.Role;
import com.stitchflow.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record ProfileResponse(
            Long id,
            String fullName,
            String email,
            Role role
    ) {}

    public record UpdateProfileRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 100)
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email address")
            @Size(max = 254)
            String email
    ) {}

    public record UpdateProfileResponse(
            String message,
            boolean requiresLogin,
            ProfileResponse profile
    ) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required")
            String currentPassword,

            @NotBlank(message = "New password is required")
            @Size(
                min = 8,
                max = 72,
                message = "New password must be 8 to 72 characters"
            )
            String newPassword,

            @NotBlank(message = "Confirm your new password")
            String confirmPassword
    ) {}

    public record MessageResponse(String message) {}

    private AppUser findCurrentUser(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please log in first"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Account not found"
                    )
                );
    }

    private ProfileResponse toResponse(AppUser user) {
        return new ProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole()
        );
    }

    private void invalidateSession(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();
    }

    // GET CURRENT USER PROFILE
    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {

        AppUser user = findCurrentUser(authentication);

        return toResponse(user);
    }

    // UPDATE CURRENT USER PROFILE
    @PutMapping
    public UpdateProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        AppUser user = findCurrentUser(authentication);

        String fullName = request.fullName().trim();
        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (fullName.length() < 2 || fullName.length() > 100) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Full name must be 2 to 100 characters"
            );
        }

        if (email.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Email is required"
            );
        }

        boolean emailChanged =
                !user.getEmail().equalsIgnoreCase(email);

        if (emailChanged &&
                userRepository.existsByEmailIgnoreCase(email)) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        user.setFullName(fullName);
        user.setEmail(email);

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Unable to save profile. Email may already be used"
            );
        }

        ProfileResponse response = toResponse(user);

        if (emailChanged) {

            // The current authentication uses the old email.
            // Log out so the user can log in with the new email.
            invalidateSession(httpRequest);

            return new UpdateProfileResponse(
                "Profile updated. Please log in with your new email.",
                true,
                response
            );
        }

        return new UpdateProfileResponse(
            "Profile updated successfully",
            false,
            response
        );
    }

    // CHANGE PASSWORD
    @PostMapping("/change-password")
    public MessageResponse changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        AppUser user = findCurrentUser(authentication);

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Current password is incorrect"
            );
        }

        if (!request.newPassword()
                .equals(request.confirmPassword())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "New passwords do not match"
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPasswordHash())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "New password must be different from the old password"
            );
        }

        user.setPasswordHash(
            passwordEncoder.encode(request.newPassword())
        );

        userRepository.saveAndFlush(user);

        // End this login session after a password change.
        invalidateSession(httpRequest);

        return new MessageResponse(
            "Password changed successfully. Please log in again."
        );
    }
}

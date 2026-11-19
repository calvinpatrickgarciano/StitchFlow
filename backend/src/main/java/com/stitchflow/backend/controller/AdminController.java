
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record StaffRequest(
        @NotBlank String fullName,

        @NotBlank
        @Email String email,

        @NotBlank
        @Size(min = 8, max = 72)
        String password
    ) {}

    public record StaffResponse(
        Long id,
        String fullName,
        String email,
        Role role
    ) {}

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffResponse createStaff(
            @Valid @RequestBody StaffRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        AppUser staff = new AppUser();

        staff.setFullName(request.fullName().trim());
        staff.setEmail(email);
        staff.setPasswordHash(
            passwordEncoder.encode(request.password())
        );
        staff.setRole(Role.TAILOR);

        try {
            AppUser saved = userRepository.saveAndFlush(staff);

            return new StaffResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole()
            );

        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Could not create staff account"
            );
        }
    }
}

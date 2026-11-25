package com.stitchflow.backend.controller;

import com.stitchflow.backend.service.PasswordRecoveryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class PasswordRecoveryController {

    private final PasswordRecoveryService recovery;

    public PasswordRecoveryController(PasswordRecoveryService recovery) {
        this.recovery = recovery;
    }

    public record ForgotRequest(
            @NotBlank(message = "Email address is required")
            @Email(message = "Enter a valid email address")
            @Size(max = 254) String email
    ) {}

    public record ResetRequest(
            @NotBlank(message = "Reset token is required") String token,
            @NotBlank(message = "New password is required")
            @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
            String newPassword,
            @NotBlank(message = "Confirm your new password") String confirmPassword
    ) {}

    public record MessageResponse(String message) {}

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotRequest request) {
        recovery.requestPasswordReset(request.email());
        return new MessageResponse(
                "If an account exists with that email, a password reset link will be sent shortly.");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetRequest request) {
        recovery.resetPassword(request.token(), request.newPassword(), request.confirmPassword());
        return new MessageResponse("Password reset successfully. Sign in with your new password.");
    }
}

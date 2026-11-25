package com.stitchflow.backend.service;

import com.stitchflow.backend.model.AppUser;
import com.stitchflow.backend.model.PasswordResetToken;
import com.stitchflow.backend.repository.PasswordResetTokenRepository;
import com.stitchflow.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@Service
public class PasswordRecoveryService {

    private static final Logger log = LoggerFactory.getLogger(PasswordRecoveryService.class);
    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);
    private static final Duration REQUEST_COOLDOWN = Duration.ofMinutes(5);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final String gmailAddress;
    private final boolean gmailPasswordConfigured;
    private final String frontendBaseUrl;

    public PasswordRecoveryService(
            UserRepository users,
            PasswordResetTokenRepository tokens,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            @Value("${GMAIL_ADDRESS:}") String gmailAddress,
            @Value("${GMAIL_APP_PASSWORD:}") String gmailAppPassword,
            @Value("${STITCHFLOW_FRONTEND_URL:http://localhost:5173}") String frontendBaseUrl) {
        this.users = users;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.gmailAddress = gmailAddress.trim();
        this.gmailPasswordConfigured = !gmailAppPassword.isBlank();
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public void requestPasswordReset(String submittedEmail) {
        // No mock links: a working SMTP configuration is required.
        if (gmailAddress.isBlank() || !gmailPasswordConfigured) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Password recovery email is not configured yet");
        }

        String email = submittedEmail.trim().toLowerCase(Locale.ROOT);
        Optional<AppUser> existing = users.findByEmailIgnoreCase(email);

        // The public response remains identical whether the email exists or not.
        if (existing.isEmpty()) {
            return;
        }

        AppUser user = existing.get();
        Instant now = Instant.now();
        if (tokens.countByUser_IdAndCreatedAtAfter(user.getId(), now.minus(REQUEST_COOLDOWN)) > 0) {
            return;
        }

        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken record = new PasswordResetToken();
        record.setUser(user);
        record.setTokenHash(sha256(rawToken));
        record.setCreatedAt(now);
        record.setExpiresAt(now.plus(TOKEN_LIFETIME));
        tokens.saveAndFlush(record);

        String url = frontendBaseUrl.replaceAll("/+$", "")
                + "/reset-password?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(gmailAddress);
        message.setTo(user.getEmail());
        message.setSubject("StitchFlow - Reset your password");
        message.setText("Hello " + user.getFullName() + ",\n\n"
                + "We received a request to reset your StitchFlow password.\n\n"
                + "Open this secure link on the computer running StitchFlow:\n"
                + url + "\n\n"
                + "This link expires in 30 minutes and can only be used once.\n"
                + "If you did not request this, ignore the message.\n\n"
                + "StitchFlow Team");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            // Avoid leaking registered emails to public callers.
            // Remove this unusable token to allow retry after SMTP is fixed.
            tokens.delete(record);
            tokens.flush();
            log.error("Gmail password-reset email could not be sent. Check SMTP credentials and connectivity.", ex);
        }
    }

    @Transactional
    public void resetPassword(String submittedToken, String newPassword, String confirmation) {
        if (!newPassword.equals(confirmation)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "New passwords do not match");
        }

        if (submittedToken == null || !submittedToken.matches("[A-Za-z0-9_-]{43}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reset link is invalid or expired");
        }

        String tokenHash = sha256(submittedToken);
        PasswordResetToken record = tokens.findForRedemption(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Reset link is invalid or expired"));

        Instant now = Instant.now();
        if (record.getConsumedAt() != null || !record.getExpiresAt().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reset link is invalid or expired");
        }

        AppUser user = record.getUser();
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Choose a new password different from the previous one");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        users.save(user);

        // Invalidate all outstanding reset links for this user, including this one.
        for (PasswordResetToken outstanding : tokens.findByUser_IdAndConsumedAtIsNull(user.getId())) {
            outstanding.setConsumedAt(now);
        }
        tokens.flush();
    }

    private String sha256(String input) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is required by Java", impossible);
        }
    }
}

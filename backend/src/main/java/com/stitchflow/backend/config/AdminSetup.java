
package com.stitchflow.backend.config;

import com.stitchflow.backend.model.AppUser;
import com.stitchflow.backend.model.Role;
import com.stitchflow.backend.repository.UserRepository;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminSetup {

    @Bean
    public ApplicationRunner createInitialAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Only create the first administrator.
            if (userRepository.existsByRole(Role.ADMIN)) {
                return;
            }

            String email = System.getenv("STITCHFLOW_ADMIN_EMAIL");
            String password = System.getenv("STITCHFLOW_ADMIN_PASSWORD");

            if (email == null || password == null
                    || email.isBlank() || password.isBlank()) {

                System.out.println(
                    "Initial admin not configured. " +
                    "Set STITCHFLOW_ADMIN_EMAIL and " +
                    "STITCHFLOW_ADMIN_PASSWORD."
                );
                return;
            }

            if (password.length() < 12) {
                throw new IllegalStateException(
                    "Admin password must have at least 12 characters."
                );
            }

            email = email.trim().toLowerCase(Locale.ROOT);

            if (userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalStateException(
                    "Admin email is already used by another account."
                );
            }

            AppUser admin = new AppUser();
            admin.setFullName("Shop Administrator");
            admin.setEmail(email);
            admin.setPasswordHash(
                passwordEncoder.encode(password)
            );
            admin.setRole(Role.ADMIN);

            userRepository.saveAndFlush(admin);

            System.out.println(
                "Initial StitchFlow administrator created."
            );
        };
    }
}

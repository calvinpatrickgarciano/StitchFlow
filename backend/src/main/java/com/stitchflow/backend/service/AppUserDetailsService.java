
package com.stitchflow.backend.service;

import com.stitchflow.backend.model.AppUser;
import com.stitchflow.backend.repository.UserRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        AppUser account = userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() ->
                new UsernameNotFoundException("Invalid credentials"));

        return User.withUsername(account.getEmail())
            .password(account.getPasswordHash())
            .authorities("ROLE_" + account.getRole().name())
            .build();
    }
}

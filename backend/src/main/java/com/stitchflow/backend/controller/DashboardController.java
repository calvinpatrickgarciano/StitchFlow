
package com.stitchflow.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @GetMapping("/customer/dashboard")
    public Map<String, String> customer(Authentication auth) {
        return Map.of(
            "message", "Customer dashboard access verified.",
            "email", auth.getName(),
            "role", "CUSTOMER"
        );
    }

    @GetMapping("/tailor/dashboard")
    public Map<String, String> tailor(Authentication auth) {
        return Map.of(
            "message", "Tailor dashboard access verified.",
            "email", auth.getName(),
            "role", "TAILOR"
        );
    }

    @GetMapping("/admin/dashboard")
    public Map<String, String> admin(Authentication auth) {
        return Map.of(
            "message", "Administrator dashboard access verified.",
            "email", auth.getName(),
            "role", "ADMIN"
        );
    }
}

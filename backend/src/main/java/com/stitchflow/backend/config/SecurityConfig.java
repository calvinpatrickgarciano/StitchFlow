
package com.stitchflow.backend.config;

import com.stitchflow.backend.service.AppUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            AppUserDetailsService users,
            PasswordEncoder encoder) {

        DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider(users);

        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider provider) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .authenticationProvider(provider)

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    HttpMethod.GET, "/api/auth/csrf"
                ).permitAll()
                .requestMatchers(
                    HttpMethod.POST, "/api/auth/register"
                ).permitAll()
                .requestMatchers("/api/customer/**")
                    .hasRole("CUSTOMER")
                .requestMatchers("/api/tailor/**")
                    .hasRole("TAILOR")
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                .requestMatchers("/api/auth/me")
                    .authenticated()
                .anyRequest().denyAll()
            )

            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler((request, response, auth) -> {
                    response.setStatus(200);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"message\":\"Login successful\"}"
                    );
                })
                .failureHandler((request, response, ex) ->
                    response.sendError(401, "Invalid email or password")
                )
                .permitAll()
            )

            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, auth) -> {
                    response.setStatus(200);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"message\":\"Logged out successfully\"}"
                    );
                })
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, error) ->
                    res.sendError(401, "Authentication required"))
                .accessDeniedHandler((req, res, error) ->
                    res.sendError(403, "Access denied"))
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ));

        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
            "Content-Type", "X-CSRF-TOKEN"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

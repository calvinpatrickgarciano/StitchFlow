
package com.stitchflow.backend.repository;

import com.stitchflow.backend.model.AppUser;
import com.stitchflow.backend.model.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRole(Role role);
}

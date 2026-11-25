package com.stitchflow.backend.repository;

import com.stitchflow.backend.model.PasswordResetToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Lock during redemption: two concurrent requests cannot redeem the same token twice.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from PasswordResetToken t join fetch t.user where t.tokenHash = :hash")
    Optional<PasswordResetToken> findForRedemption(@Param("hash") String hash);

    long countByUser_IdAndCreatedAtAfter(Long userId, Instant after);

    List<PasswordResetToken> findByUser_IdAndConsumedAtIsNull(Long userId);
}

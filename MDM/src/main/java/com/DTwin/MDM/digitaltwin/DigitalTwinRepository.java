package com.DTwin.MDM.digitaltwin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DigitalTwinRepository
        extends JpaRepository<DigitalTwin, Long> {

    Optional<DigitalTwin> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
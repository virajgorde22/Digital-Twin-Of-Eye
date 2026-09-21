package com.DTwin.MDM.scan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EyeScanRepository
        extends JpaRepository<EyeScan, Long> {

    List<EyeScan> findByDigitalTwinId(Long digitalTwinId);

    List<EyeScan> findByDigitalTwinIdAndEyeSide(
            Long digitalTwinId,
            EyeScan.EyeSide eyeSide
    );

    Optional<EyeScan> findByIdAndDigitalTwinId(
            Long id,
            Long digitalTwinId
    );
}
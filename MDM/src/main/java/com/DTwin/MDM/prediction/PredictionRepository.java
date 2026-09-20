package com.DTwin.MDM.prediction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PredictionRepository
        extends JpaRepository<Prediction, Long> {

    Optional<Prediction> findByScanId(Long scanId);
}
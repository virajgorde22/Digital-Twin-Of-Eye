package com.DTwin.MDM.rag;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RagRecommendationRepository
        extends JpaRepository<RagRecommendation, Long> {

    Optional<RagRecommendation> findByPredictionId(Long predictionId);
}
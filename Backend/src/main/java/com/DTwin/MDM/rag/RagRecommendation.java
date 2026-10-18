package com.DTwin.MDM.rag;

import com.DTwin.MDM.prediction.Prediction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rag_recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RagRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id", nullable = false, unique = true)
    private Prediction prediction;

    @Column(columnDefinition = "TEXT")
    private String diseaseExplanation;

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(columnDefinition = "TEXT")
    private String lifestyle;

    @Column(columnDefinition = "TEXT")
    private String followUp;

    @Column(columnDefinition = "TEXT")
    private String warningSigns;

    @Column(columnDefinition = "TEXT")
    private String sources;

    @Column(columnDefinition = "TEXT")
    private String disclaimer;

    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        generatedAt = LocalDateTime.now();
    }
}
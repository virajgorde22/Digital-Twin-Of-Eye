package com.DTwin.MDM.prediction;

import com.DTwin.MDM.scan.EyeScan;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "scan_id", nullable = false, unique = true)
    private EyeScan scan;

    private String disease;

    private String severity;

    private Double confidence;

    private String gradCamUrl;

    private LocalDateTime predictionDate;

    @PrePersist
    protected void onCreate() {
        predictionDate = LocalDateTime.now();
    }
}
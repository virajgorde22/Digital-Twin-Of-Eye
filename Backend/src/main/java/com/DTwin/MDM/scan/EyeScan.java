package com.DTwin.MDM.scan;

import com.DTwin.MDM.digitaltwin.DigitalTwin;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "eye_scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EyeScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "digital_twin_id", nullable = false)
    private DigitalTwin digitalTwin;

    @Column(nullable = false)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EyeSide eyeSide;

    @Column(nullable = false)
    private LocalDateTime scanDate;

    @PrePersist
    protected void onCreate() {
        scanDate = LocalDateTime.now();
    }

    public enum EyeSide {
        LEFT,
        RIGHT
    }
}
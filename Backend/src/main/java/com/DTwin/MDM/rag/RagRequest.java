package com.DTwin.MDM.rag;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RagRequest {

    private Long predictionId;
    private String disease;
    private Double confidence;
    private String eyeSide;

    private Integer age;
    private String gender;
    private String diabetes;
    private String hypertension;
    private String previousEyeDisease;
    private String currentMedication;
    private String additionalInformation;
}
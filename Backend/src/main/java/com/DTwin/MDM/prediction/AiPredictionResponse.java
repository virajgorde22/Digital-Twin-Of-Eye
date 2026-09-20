package com.DTwin.MDM.prediction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionResponse {

    private String disease;

    private String severity;

    private Double confidence;

    private String gradCamUrl;
}
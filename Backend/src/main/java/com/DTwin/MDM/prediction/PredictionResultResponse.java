package com.DTwin.MDM.prediction;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResultResponse {

    // =========================================================
    // SCAN INFORMATION
    // =========================================================

    private Long scanId;

    private String eyeSide;

    private String filename;


    // =========================================================
    // COMPLETE AI MODEL OUTPUT
    // =========================================================

    private Map<String, Double> rfmid;

    private Map<String, Double> odir;


    // =========================================================
    // TOP PREDICTIONS
    // =========================================================

    private AiPredictionResponse.TopPrediction
            rfmidTopPrediction;

    private AiPredictionResponse.TopPrediction
            odirTopPrediction;


    // =========================================================
    // STORED PRIMARY PREDICTION
    // =========================================================

    private Long predictionId;

    private String disease;

    private String severity;

    private Double confidence;

    private String gradCamUrl;
}
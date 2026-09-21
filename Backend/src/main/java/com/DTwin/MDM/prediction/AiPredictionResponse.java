package com.DTwin.MDM.prediction;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionResponse {

    private String filename;

    private Map<String, Double> rfmid;

    private Map<String, Double> odir;

    private TopPrediction rfmidTopPrediction;

    private TopPrediction odirTopPrediction;


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPrediction {

        private String disease;

        private Double confidence;
    }
}
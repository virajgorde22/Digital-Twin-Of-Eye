package com.DTwin.MDM.rag;

import com.DTwin.MDM.health.HealthProfile;
import com.DTwin.MDM.health.HealthProfileRepository;
import com.DTwin.MDM.prediction.Prediction;
import com.DTwin.MDM.prediction.PredictionRepository;
import java.util.Collections;
import java.util.List;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

@Service
public class RagService {

    private final RagClient ragClient;
    private final PredictionRepository predictionRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final RagRecommendationRepository recommendationRepository;
    private final ObjectMapper objectMapper;

    public RagService(
            RagClient ragClient,
            PredictionRepository predictionRepository,
            HealthProfileRepository healthProfileRepository,
            RagRecommendationRepository recommendationRepository,
            ObjectMapper objectMapper) {

        this.ragClient = ragClient;
        this.predictionRepository = predictionRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.recommendationRepository = recommendationRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RagResponse generateRecommendation(
            Long predictionId,
            String authenticatedEmail) {

        // 1. Retrieve the existing prediction
        Prediction prediction = predictionRepository.findById(predictionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Prediction not found"));

        // 2. Verify that the prediction belongs to the logged-in user
        String ownerEmail = prediction.getScan()
                .getDigitalTwin()
                .getUser()
                .getEmail();

        if (!ownerEmail.equalsIgnoreCase(authenticatedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access another patient's prediction");
        }

        // 3. Retrieve the patient's health profile
        Long userId = prediction.getScan()
                .getDigitalTwin()
                .getUser()
                .getId();

        HealthProfile profile = healthProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Health profile not found"));

        // 4. Build the RAG input from trusted backend data
        RagRequest request = RagRequest.builder()
                .predictionId(prediction.getId())
                .disease(prediction.getDisease())
                .confidence(prediction.getConfidence())
                .eyeSide(prediction.getScan().getEyeSide().name())
                .age(profile.getAge())
                .gender(safeString(profile.getGender()))
                .diabetes(safeString(profile.getDiabetes()))
                .hypertension(safeString(profile.getHypertension()))
                .previousEyeDisease(
                        safeString(profile.getPreviousEyeDisease()))
                .currentMedication(
                        safeString(profile.getCurrentMedication()))
                .additionalInformation(
                        safeString(profile.getAdditionalInformation()))
                .build();

        // 5. Call the Python RAG service
        RagResponse response =
                ragClient.generateRecommendation(request);

        // 6. Save or update the recommendation for this prediction
        RagRecommendation recommendation =
                recommendationRepository
                        .findByPredictionId(predictionId)
                        .orElseGet(RagRecommendation::new);

        recommendation.setPrediction(prediction);
        recommendation.setDiseaseExplanation(
                response.getDiseaseExplanation());
        recommendation.setTreatmentPlan(
                toJson(response.getTreatmentPlan()));
        recommendation.setLifestyle(
                toJson(response.getLifestyle()));
        recommendation.setFollowUp(response.getFollowUp());
        recommendation.setWarningSigns(
                toJson(response.getWarningSigns()));
        recommendation.setSources(toJson(response.getSources()));
        recommendation.setDisclaimer(response.getDisclaimer());

        recommendationRepository.save(recommendation);

        return response;
    }

    @Transactional(readOnly = true)
    public RagResponse getRecommendation(
            Long predictionId,
            String authenticatedEmail) {

        Prediction prediction = predictionRepository.findById(predictionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Prediction not found"));

        String ownerEmail = prediction.getScan()
                .getDigitalTwin()
                .getUser()
                .getEmail();

        if (!ownerEmail.equalsIgnoreCase(authenticatedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access another patient's recommendation");
        }

        RagRecommendation saved = recommendationRepository
                .findByPredictionId(predictionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Recommendation not found"));

        return RagResponse.builder()
                .disease(prediction.getDisease())
                .diseaseExplanation(saved.getDiseaseExplanation())
                .treatmentPlan(fromJson(saved.getTreatmentPlan()))
                .lifestyle(fromJson(saved.getLifestyle()))
                .followUp(saved.getFollowUp())
                .warningSigns(fromJson(saved.getWarningSigns()))
                .sources(fromJson(saved.getSources()))
                .disclaimer(saved.getDisclaimer())
                .build();
    }

    private String safeString(Object value) {
        return value == null ? null : value.toString();
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(
                    values == null ? Collections.emptyList() : values);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Could not serialize RAG response", e);
        }
    }

    private List<String> fromJson(String json) {
        try {
            if (json == null || json.isBlank()) {
                return Collections.emptyList();
            }

            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Could not deserialize saved RAG response", e);
        }
    }
}
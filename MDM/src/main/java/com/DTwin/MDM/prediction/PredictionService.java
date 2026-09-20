package com.DTwin.MDM.prediction;

import com.DTwin.MDM.digitaltwin.DigitalTwin;
import com.DTwin.MDM.digitaltwin.DigitalTwinRepository;
import com.DTwin.MDM.scan.EyeScan;
import com.DTwin.MDM.scan.EyeScanRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final EyeScanRepository eyeScanRepository;
    private final DigitalTwinRepository digitalTwinRepository;
    private final AiServiceClient aiServiceClient;

    public PredictionService(
            PredictionRepository predictionRepository,
            EyeScanRepository eyeScanRepository,
            DigitalTwinRepository digitalTwinRepository,
            AiServiceClient aiServiceClient) {

        this.predictionRepository = predictionRepository;
        this.eyeScanRepository = eyeScanRepository;
        this.digitalTwinRepository = digitalTwinRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public Prediction analyzeScan(
            Long scanId,
            MultipartFile image) {

        // 1. Find scan
        EyeScan scan =
                eyeScanRepository.findById(scanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Eye scan not found"));

        // 2. Send image to FastAPI
        AiPredictionResponse aiResponse =
                aiServiceClient.predict(image);

        // 3. Create prediction
        Prediction prediction =
                Prediction.builder()
                        .scan(scan)
                        .disease(aiResponse.getDisease())
                        .severity(aiResponse.getSeverity())
                        .confidence(aiResponse.getConfidence())
                        .gradCamUrl(aiResponse.getGradCamUrl())
                        .build();

        // 4. Save prediction
        Prediction savedPrediction =
                predictionRepository.save(prediction);

        // 5. Update Digital Twin
        DigitalTwin digitalTwin =
                scan.getDigitalTwin();

        digitalTwin.setCurrentDisease(
                aiResponse.getDisease());

        digitalTwin.setCurrentSeverity(
                aiResponse.getSeverity());

        digitalTwin.setCurrentConfidence(
                aiResponse.getConfidence());

        digitalTwin.setLastScanDate(
                scan.getScanDate());

        digitalTwinRepository.save(digitalTwin);

        return savedPrediction;
    }

    public Prediction getPrediction(Long scanId) {

        return predictionRepository
                .findByScanId(scanId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Prediction not found"));
    }
}
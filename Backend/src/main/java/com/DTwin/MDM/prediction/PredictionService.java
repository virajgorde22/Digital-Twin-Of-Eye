package com.DTwin.MDM.prediction;

import com.DTwin.MDM.digitaltwin.DigitalTwin;
import com.DTwin.MDM.digitaltwin.DigitalTwinRepository;
import com.DTwin.MDM.scan.EyeScan;
import com.DTwin.MDM.scan.EyeScanRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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


    // =========================================================
    // ANALYZE SCAN
    // =========================================================

    @Transactional
    public PredictionResultResponse analyzeScan(
            Long scanId,
            MultipartFile image) {

        // -----------------------------------------------------
        // 1. Find Eye Scan
        // -----------------------------------------------------

        EyeScan scan =
                eyeScanRepository.findById(scanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Eye scan not found"
                                )
                        );


        // -----------------------------------------------------
        // 2. Send image to FastAPI
        // -----------------------------------------------------

        AiPredictionResponse aiResponse =
                aiServiceClient.predict(image);


        if (aiResponse == null) {

            throw new RuntimeException(
                    "No response received from AI service"
            );
        }


        // -----------------------------------------------------
        // 3. Validate ODIR prediction
        // -----------------------------------------------------

        if (aiResponse.getOdirTopPrediction() == null) {

            throw new RuntimeException(
                    "ODIR top prediction not received"
            );
        }


        // -----------------------------------------------------
        // 4. Select primary prediction
        // -----------------------------------------------------

        AiPredictionResponse.TopPrediction
                primaryPrediction =
                aiResponse.getOdirTopPrediction();


        // -----------------------------------------------------
        // 5. Find existing prediction
        // -----------------------------------------------------

        Prediction prediction =
                predictionRepository
                        .findByScanId(scanId)
                        .orElse(null);


        // -----------------------------------------------------
        // 6. Create OR Update Prediction
        // -----------------------------------------------------

        if (prediction == null) {

            // First analysis of this scan
            prediction =
                    Prediction.builder()
                            .scan(scan)
                            .build();
        }


        // Update values
        prediction.setDisease(
                primaryPrediction.getDisease()
        );

        prediction.setConfidence(
                primaryPrediction.getConfidence()
        );

        // Currently not returned by FastAPI
        prediction.setSeverity(null);

        // Currently not returned by FastAPI
        prediction.setGradCamUrl(null);


        // Save
        Prediction savedPrediction =
                predictionRepository.save(prediction);


        // -----------------------------------------------------
        // 7. Update Digital Twin
        // -----------------------------------------------------

        DigitalTwin digitalTwin =
                scan.getDigitalTwin();


        digitalTwin.setCurrentDisease(
                primaryPrediction.getDisease()
        );

        digitalTwin.setCurrentConfidence(
                primaryPrediction.getConfidence()
        );

        digitalTwin.setCurrentSeverity(null);

        digitalTwin.setLastScanDate(
                scan.getScanDate()
        );


        digitalTwinRepository.save(digitalTwin);


        // -----------------------------------------------------
        // 8. Return COMPLETE AI RESPONSE
        // -----------------------------------------------------

        return PredictionResultResponse.builder()

                // Scan information
                .scanId(scan.getId())

                .eyeSide(
                        scan.getEyeSide().name()
                )

                .filename(
                        aiResponse.getFilename()
                )

                // Complete RFMiD results
                .rfmid(
                        aiResponse.getRfmid()
                )

                // Complete ODIR results
                .odir(
                        aiResponse.getOdir()
                )

                // Top predictions
                .rfmidTopPrediction(
                        aiResponse.getRfmidTopPrediction()
                )

                .odirTopPrediction(
                        aiResponse.getOdirTopPrediction()
                )

                // Database prediction
                .predictionId(
                        savedPrediction.getId()
                )

                .disease(
                        savedPrediction.getDisease()
                )

                .severity(
                        savedPrediction.getSeverity()
                )

                .confidence(
                        savedPrediction.getConfidence()
                )

                .gradCamUrl(
                        savedPrediction.getGradCamUrl()
                )

                .build();
    }


    // =========================================================
    // GET STORED PREDICTION
    // =========================================================

    public PredictionResultResponse getPrediction(
            Long scanId) {

        Prediction prediction =
                predictionRepository
                        .findByScanId(scanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Prediction not found"
                                )
                        );

        EyeScan scan =
                prediction.getScan();

        return PredictionResultResponse.builder()

                .scanId(scan.getId())

                .eyeSide(
                        scan.getEyeSide().name()
                )

                .predictionId(
                        prediction.getId()
                )

                .disease(
                        prediction.getDisease()
                )

                .severity(
                        prediction.getSeverity()
                )

                .confidence(
                        prediction.getConfidence()
                )

                .gradCamUrl(
                        prediction.getGradCamUrl()
                )

                .build();
    }
}
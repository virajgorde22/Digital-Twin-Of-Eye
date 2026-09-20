package com.DTwin.MDM.prediction;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(
            PredictionService predictionService) {

        this.predictionService = predictionService;
    }

    // ANALYZE IMAGE
    @PostMapping("/analyze/{scanId}")
    public ResponseEntity<Prediction> analyzeScan(

            @PathVariable Long scanId,

            @RequestParam("image")
            MultipartFile image) {

        return ResponseEntity.ok(
                predictionService.analyzeScan(
                        scanId,
                        image
                )
        );
    }

    // GET PREDICTION
    @GetMapping("/scan/{scanId}")
    public ResponseEntity<Prediction> getPrediction(
            @PathVariable Long scanId) {

        return ResponseEntity.ok(
                predictionService.getPrediction(scanId)
        );
    }
}
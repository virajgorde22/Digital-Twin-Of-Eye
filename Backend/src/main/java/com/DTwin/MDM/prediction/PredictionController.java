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

        this.predictionService =
                predictionService;
    }


    // =========================================================
    // ANALYZE IMAGE
    // =========================================================

    @PostMapping("/analyze/{scanId}")
    public ResponseEntity<PredictionResultResponse>
    analyzeScan(

            @PathVariable Long scanId,

            @RequestParam("image")
            MultipartFile image) {


        PredictionResultResponse result =
                predictionService.analyzeScan(
                        scanId,
                        image
                );


        return ResponseEntity.ok(result);
    }


    // =========================================================
    // GET PREDICTION
    // =========================================================

    @GetMapping("/scan/{scanId}")
    public ResponseEntity<PredictionResultResponse>
    getPrediction(

            @PathVariable Long scanId) {


        PredictionResultResponse result =
                predictionService.getPrediction(
                        scanId
                );


        return ResponseEntity.ok(result);
    }
}
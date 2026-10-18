package com.DTwin.MDM.rag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/generate/{predictionId}")
    public ResponseEntity<RagResponse> generateRecommendation(
            @PathVariable Long predictionId,
            Authentication authentication) {

        RagResponse response =
                ragService.generateRecommendation(
                        predictionId,
                        authentication.getName());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/prediction/{predictionId}")
    public ResponseEntity<RagResponse> getRecommendation(
            @PathVariable Long predictionId,
            Authentication authentication) {

        RagResponse response =
                ragService.getRecommendation(
                        predictionId,
                        authentication.getName());

        return ResponseEntity.ok(response);
    }
}
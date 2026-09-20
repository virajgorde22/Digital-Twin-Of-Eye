package com.DTwin.MDM.health;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health-profile")
public class HealthProfileController {

    private final HealthProfileService healthProfileService;

    public HealthProfileController(
            HealthProfileService healthProfileService) {

        this.healthProfileService = healthProfileService;
    }

    /**
     * Create or update health profile.
     */
    @PostMapping
    public ResponseEntity<HealthProfile> saveProfile(
            Authentication authentication,
            @RequestBody HealthProfile profileData) {

        String email = authentication.getName();

        HealthProfile profile =
                healthProfileService.saveOrUpdateProfile(
                        email,
                        profileData
                );

        return ResponseEntity.ok(profile);
    }

    /**
     * Get current user's health profile.
     */
    @GetMapping
    public ResponseEntity<HealthProfile> getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        HealthProfile profile =
                healthProfileService.getProfile(email);

        return ResponseEntity.ok(profile);
    }

    /**
     * Delete current user's health profile.
     */
    @DeleteMapping
    public ResponseEntity<String> deleteProfile(
            Authentication authentication) {

        String email = authentication.getName();

        healthProfileService.deleteProfile(email);

        return ResponseEntity.ok(
                "Health profile deleted successfully"
        );
    }
}
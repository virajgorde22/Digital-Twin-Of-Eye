package com.DTwin.MDM.health;

import com.DTwin.MDM.user.User;
import com.DTwin.MDM.user.UserService;

import org.springframework.stereotype.Service;

@Service
public class HealthProfileService {

    private final HealthProfileRepository healthProfileRepository;
    private final UserService userService;

    public HealthProfileService(
            HealthProfileRepository healthProfileRepository,
            UserService userService) {

        this.healthProfileRepository = healthProfileRepository;
        this.userService = userService;
    }

    /**
     * Create or update the health profile
     * of the currently authenticated user.
     */
    public HealthProfile saveOrUpdateProfile(
            String email,
            HealthProfile profileData) {

        User user = userService.getUserByEmail(email);

        HealthProfile profile =
                healthProfileRepository
                        .findByUserId(user.getId())
                        .orElse(new HealthProfile());

        profile.setUser(user);

        profile.setAge(profileData.getAge());
        profile.setGender(profileData.getGender());

        profile.setDiabetes(
                profileData.getDiabetes()
        );

        profile.setHypertension(
                profileData.getHypertension()
        );

        profile.setHighCholesterol(
                profileData.getHighCholesterol()
        );

        profile.setFamilyHistory(
                profileData.getFamilyHistory()
        );

        profile.setPreviousEyeDisease(
                profileData.getPreviousEyeDisease()
        );

        profile.setPreviousEyeTreatment(
                profileData.getPreviousEyeTreatment()
        );

        profile.setCurrentMedication(
                profileData.getCurrentMedication()
        );

        profile.setAdditionalInformation(
                profileData.getAdditionalInformation()
        );

        return healthProfileRepository.save(profile);
    }

    /**
     * Get the health profile of the
     * currently authenticated user.
     */
    public HealthProfile getProfile(String email) {

        User user = userService.getUserByEmail(email);

        return healthProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Health profile not found"
                        )
                );
    }

    /**
     * Delete the current user's health profile.
     */
    public void deleteProfile(String email) {

        User user = userService.getUserByEmail(email);

        HealthProfile profile =
                healthProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Health profile not found"
                                )
                        );

        healthProfileRepository.delete(profile);
    }
}
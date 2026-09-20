package com.DTwin.MDM.digitaltwin;

import com.DTwin.MDM.user.User;
import com.DTwin.MDM.user.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DigitalTwinService {

    private final DigitalTwinRepository digitalTwinRepository;
    private final UserRepository userRepository;

    public DigitalTwinService(
            DigitalTwinRepository digitalTwinRepository,
            UserRepository userRepository) {

        this.digitalTwinRepository = digitalTwinRepository;
        this.userRepository = userRepository;
    }

    // CREATE DIGITAL TWIN
    public DigitalTwin createDigitalTwin(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (digitalTwinRepository.existsByUserId(userId)) {
            throw new RuntimeException(
                    "Digital Twin already exists");
        }

        DigitalTwin digitalTwin = DigitalTwin.builder()
                .user(user)
                .build();

        return digitalTwinRepository.save(digitalTwin);
    }

    // GET DIGITAL TWIN
    public DigitalTwin getDigitalTwin(Long userId) {

        return digitalTwinRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Digital Twin not found"));
    }

    // UPDATE CURRENT STATUS
    public DigitalTwin updateCurrentStatus(
            Long digitalTwinId,
            String disease,
            String severity,
            Double confidence) {

        DigitalTwin digitalTwin =
                digitalTwinRepository.findById(digitalTwinId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Digital Twin not found"));

        digitalTwin.setCurrentDisease(disease);
        digitalTwin.setCurrentSeverity(severity);
        digitalTwin.setCurrentConfidence(confidence);

        return digitalTwinRepository.save(digitalTwin);
    }
}
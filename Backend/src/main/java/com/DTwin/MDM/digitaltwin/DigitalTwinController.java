package com.DTwin.MDM.digitaltwin;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/digital-twin")
@CrossOrigin(origins = "http://localhost:5173")
public class DigitalTwinController {

    private final DigitalTwinService digitalTwinService;

    public DigitalTwinController(
            DigitalTwinService digitalTwinService) {

        this.digitalTwinService = digitalTwinService;
    }

    // CREATE
    @PostMapping("/{userId}")
    public ResponseEntity<DigitalTwin> createDigitalTwin(
            @PathVariable Long userId) {

        return new ResponseEntity<>(
                digitalTwinService.createDigitalTwin(userId),
                HttpStatus.CREATED
        );
    }

    // GET
    @GetMapping("/{userId}")
    public ResponseEntity<DigitalTwin> getDigitalTwin(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                digitalTwinService.getDigitalTwin(userId)
        );
    }
}
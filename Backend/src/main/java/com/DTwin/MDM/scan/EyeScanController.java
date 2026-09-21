package com.DTwin.MDM.scan;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/scans")
@CrossOrigin(origins = "http://localhost:5173")
public class EyeScanController {

    private final EyeScanService eyeScanService;

    public EyeScanController(
            EyeScanService eyeScanService) {

        this.eyeScanService = eyeScanService;
    }


    // =========================================================
    // CREATE NEW EYE SCAN
    // =========================================================

    @PostMapping
    public ResponseEntity<EyeScan> createScan(
            Authentication authentication,

            @RequestParam("image")
            MultipartFile image,

            @RequestParam("eyeSide")
            EyeScan.EyeSide eyeSide) {

        String email =
                authentication.getName();

        EyeScan scan =
                eyeScanService.createScan(
                        email,
                        eyeSide,
                        image
                );

        return ResponseEntity.ok(scan);
    }


    // =========================================================
    // GET ALL SCANS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<EyeScan>> getMyScans(
            Authentication authentication) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                eyeScanService.getMyScans(email)
        );
    }


    // =========================================================
    // GET SCANS BY EYE SIDE
    // =========================================================

    @GetMapping("/eye/{eyeSide}")
    public ResponseEntity<List<EyeScan>>
    getMyScansByEyeSide(
            Authentication authentication,

            @PathVariable
            EyeScan.EyeSide eyeSide) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                eyeScanService.getMyScansByEyeSide(
                        email,
                        eyeSide
                )
        );
    }


    // =========================================================
    // GET SINGLE SCAN
    // =========================================================

    @GetMapping("/{scanId}")
    public ResponseEntity<EyeScan> getScan(
            Authentication authentication,

            @PathVariable Long scanId) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                eyeScanService.getMyScan(
                        email,
                        scanId
                )
        );
    }
}
package com.DTwin.MDM.scan;

import com.DTwin.MDM.digitaltwin.DigitalTwin;
import com.DTwin.MDM.digitaltwin.DigitalTwinRepository;
import com.DTwin.MDM.user.User;
import com.DTwin.MDM.user.UserService;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
public class EyeScanService {

    private final EyeScanRepository eyeScanRepository;
    private final DigitalTwinRepository digitalTwinRepository;
    private final UserService userService;

    private final Path uploadDirectory =
            Paths.get("uploads/retinal-images");

    public EyeScanService(
            EyeScanRepository eyeScanRepository,
            DigitalTwinRepository digitalTwinRepository,
            UserService userService) {

        this.eyeScanRepository = eyeScanRepository;
        this.digitalTwinRepository = digitalTwinRepository;
        this.userService = userService;
    }

    // =========================================================
    // CREATE EYE SCAN
    // =========================================================

    public EyeScan createScan(
            String email,
            EyeScan.EyeSide eyeSide,
            MultipartFile image) {

        try {

            // 1. Find authenticated user
            User user =
                    userService.getUserByEmail(email);


            // 2. Find user's Digital Twin
            DigitalTwin digitalTwin =
                    digitalTwinRepository.findByUserId(
                            user.getId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Digital Twin not found. " +
                                            "Please create Digital Twin first."
                            )
                    );


            // 3. Validate image
            if (image == null || image.isEmpty()) {

                throw new RuntimeException(
                        "Retinal image is required"
                );
            }


            // 4. Validate file type
            String contentType =
                    image.getContentType();

            if (contentType == null ||
                    !contentType.startsWith("image/")) {

                throw new RuntimeException(
                        "Only image files are allowed"
                );
            }


            // 5. Create upload directory
            Files.createDirectories(
                    uploadDirectory
            );


            // 6. Generate unique filename
            String originalFilename =
                    image.getOriginalFilename();

            String extension = "";

            if (originalFilename != null &&
                    originalFilename.contains(".")) {

                extension =
                        originalFilename.substring(
                                originalFilename.lastIndexOf(".")
                        );
            }

            String filename =
                    eyeSide.name().toLowerCase()
                            + "_"
                            + System.currentTimeMillis()
                            + extension;


            // 7. Save image
            Path filePath =
                    uploadDirectory.resolve(filename);

            Files.copy(
                    image.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );


            // 8. Store relative image path
            String imageUrl =
                    "/uploads/retinal-images/"
                            + filename;


            // 9. Create EyeScan
            EyeScan eyeScan =
                    EyeScan.builder()
                            .digitalTwin(digitalTwin)
                            .imageUrl(imageUrl)
                            .eyeSide(eyeSide)
                            .build();


            // 10. Save EyeScan
            return eyeScanRepository.save(
                    eyeScan
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save retinal image",
                    e
            );
        }
    }


    // =========================================================
    // GET ALL SCANS OF CURRENT USER
    // =========================================================

    public List<EyeScan> getMyScans(
            String email) {

        User user =
                userService.getUserByEmail(email);

        DigitalTwin digitalTwin =
                digitalTwinRepository.findByUserId(
                        user.getId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Digital Twin not found"
                        )
                );

        return eyeScanRepository.findByDigitalTwinId(
                digitalTwin.getId()
        );
    }


    // =========================================================
    // GET SCANS BY EYE SIDE
    // =========================================================

    public List<EyeScan> getMyScansByEyeSide(
            String email,
            EyeScan.EyeSide eyeSide) {

        User user =
                userService.getUserByEmail(email);

        DigitalTwin digitalTwin =
                digitalTwinRepository.findByUserId(
                        user.getId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Digital Twin not found"
                        )
                );

        return eyeScanRepository
                .findByDigitalTwinIdAndEyeSide(
                        digitalTwin.getId(),
                        eyeSide
                );
    }


    // =========================================================
    // GET SINGLE SCAN
    // =========================================================

    public EyeScan getMyScan(
            String email,
            Long scanId) {

        User user =
                userService.getUserByEmail(email);

        DigitalTwin digitalTwin =
                digitalTwinRepository.findByUserId(
                        user.getId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Digital Twin not found"
                        )
                );

        return eyeScanRepository
                .findByIdAndDigitalTwinId(
                        scanId,
                        digitalTwin.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Eye scan not found"
                        )
                );
    }
}
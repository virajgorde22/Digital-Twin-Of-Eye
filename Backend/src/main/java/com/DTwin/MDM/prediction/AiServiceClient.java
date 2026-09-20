package com.DTwin.MDM.prediction;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Component
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AiPredictionResponse predict(MultipartFile image) {

        try {

            ByteArrayResource resource =
                    new ByteArrayResource(image.getBytes()) {

                        @Override
                        public String getFilename() {
                            return image.getOriginalFilename();
                        }
                    };

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(
                    MediaType.MULTIPART_FORM_DATA
            );

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AiPredictionResponse> response =
                    restTemplate.exchange(
                            aiServiceUrl + "/predict",
                            HttpMethod.POST,
                            request,
                            AiPredictionResponse.class
                    );

            return response.getBody();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to communicate with AI service: "
                            + e.getMessage(),
                    e
            );
        }
    }
}
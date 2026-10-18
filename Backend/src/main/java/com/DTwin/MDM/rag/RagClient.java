package com.DTwin.MDM.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RagClient {

    private final RestTemplate restTemplate;

    @Value("${rag.service.url}")
    private String ragServiceUrl;

    public RagClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public RagResponse generateRecommendation(RagRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<RagRequest> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<RagResponse> response =
                    restTemplate.exchange(
                            ragServiceUrl + "/rag/generate",
                            HttpMethod.POST,
                            entity,
                            RagResponse.class
                    );

            if (response.getBody() == null) {
                throw new IllegalStateException(
                        "RAG service returned an empty response"
                );
            }

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to communicate with RAG service: "
                            + e.getMessage(),
                    e
            );
        }
    }
}
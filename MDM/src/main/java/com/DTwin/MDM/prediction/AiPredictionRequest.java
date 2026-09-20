package com.DTwin.MDM.prediction;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiPredictionRequest {

    private Long scanId;

    private String eyeSide;

    private String imageName;
}
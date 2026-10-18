package com.DTwin.MDM.rag;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RagResponse {

    private String disease;
    private String diseaseExplanation;
    private List<String> treatmentPlan;
    private List<String> lifestyle;
    private String followUp;
    private List<String> warningSigns;
    private List<String> sources;
    private String disclaimer;
}
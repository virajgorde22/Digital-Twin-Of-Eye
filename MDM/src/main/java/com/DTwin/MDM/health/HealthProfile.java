package com.DTwin.MDM.health;

import com.DTwin.MDM.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_profiles")
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * One user has one health profile.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    private Integer age;

    @Column(length = 20)
    private String gender;

    /*
     * Important systemic conditions that may
     * be relevant to eye health.
     */
    private Boolean diabetes;

    private Boolean hypertension;

    private Boolean highCholesterol;

    /*
     * Family history of eye disease.
     */
    private Boolean familyHistory;

    @Column(length = 500)
    private String previousEyeDisease;

    @Column(length = 500)
    private String previousEyeTreatment;

    @Column(length = 500)
    private String currentMedication;

    @Column(length = 1000)
    private String additionalInformation;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public HealthProfile() {
    }

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (diabetes == null) {
            diabetes = false;
        }

        if (hypertension == null) {
            hypertension = false;
        }

        if (highCholesterol == null) {
            highCholesterol = false;
        }

        if (familyHistory == null) {
            familyHistory = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Integer getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    public Boolean getDiabetes() {
        return diabetes;
    }

    public Boolean getHypertension() {
        return hypertension;
    }

    public Boolean getHighCholesterol() {
        return highCholesterol;
    }

    public Boolean getFamilyHistory() {
        return familyHistory;
    }

    public String getPreviousEyeDisease() {
        return previousEyeDisease;
    }

    public String getPreviousEyeTreatment() {
        return previousEyeTreatment;
    }

    public String getCurrentMedication() {
        return currentMedication;
    }

    public String getAdditionalInformation() {
        return additionalInformation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setDiabetes(Boolean diabetes) {
        this.diabetes = diabetes;
    }

    public void setHypertension(Boolean hypertension) {
        this.hypertension = hypertension;
    }

    public void setHighCholesterol(Boolean highCholesterol) {
        this.highCholesterol = highCholesterol;
    }

    public void setFamilyHistory(Boolean familyHistory) {
        this.familyHistory = familyHistory;
    }

    public void setPreviousEyeDisease(String previousEyeDisease) {
        this.previousEyeDisease = previousEyeDisease;
    }

    public void setPreviousEyeTreatment(String previousEyeTreatment) {
        this.previousEyeTreatment = previousEyeTreatment;
    }

    public void setCurrentMedication(String currentMedication) {
        this.currentMedication = currentMedication;
    }

    public void setAdditionalInformation(String additionalInformation) {
        this.additionalInformation = additionalInformation;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
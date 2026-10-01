package com.spendsense.spendsense_backend.dto;

import java.util.List;

public class CategorySuggestionResponse {

    private String category;
    private double confidence;
    private List<String> matchedKeywords;
    private String reason;

    public CategorySuggestionResponse(
            String category,
            double confidence,
            List<String> matchedKeywords,
            String reason) {

        this.category = category;
        this.confidence = confidence;
        this.matchedKeywords = matchedKeywords;
        this.reason = reason;
    }

    public String getCategory() {
        return category;
    }

    public double getConfidence() {
        return confidence;
    }

    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }

    public String getReason() {
        return reason;
    }
}
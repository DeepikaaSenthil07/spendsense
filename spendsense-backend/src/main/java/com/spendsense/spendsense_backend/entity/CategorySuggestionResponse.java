package com.spendsense.spendsense_backend.entity;

import java.util.Map;

public class CategorySuggestionResponse {

    private String category;
    private int confidence;
    private Map<String, Integer> scores;

    public CategorySuggestionResponse(
            String category,
            int confidence,
            Map<String, Integer> scores) {

        this.category = category;
        this.confidence = confidence;
        this.scores = scores;
    }

    public String getCategory() {
        return category;
    }

    public int getConfidence() {
        return confidence;
    }

    public Map<String, Integer> getScores() {
        return scores;
    }
}
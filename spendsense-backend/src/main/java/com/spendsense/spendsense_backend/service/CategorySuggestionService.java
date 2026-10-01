package com.spendsense.spendsense_backend.service;

import org.springframework.stereotype.Service;

import com.spendsense.spendsense_backend.entity.CategorySuggestionResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class CategorySuggestionService {

    public String suggestCategory(String text) {

        Map<String, Integer> scores = calculateScores(text);

        String bestCategory = "OTHER";
        int highestScore = 0;

        for (Map.Entry<String, Integer> entry : scores.entrySet()) {

            if (entry.getValue() > highestScore) {
                highestScore = entry.getValue();
                bestCategory = entry.getKey();
            }
        }

        return bestCategory;
    }

    public Map<String, Integer> calculateScores(String text) {

        Map<String, Integer> scores = new HashMap<>();

        scores.put("FOOD", 0);
        scores.put("TRANSPORT", 0);
        scores.put("EDUCATION", 0);
        scores.put("SHOPPING", 0);
        scores.put("ENTERTAINMENT", 0);
        scores.put("HEALTH", 0);
        scores.put("BILLS", 0);

        if (text == null || text.trim().isEmpty()) {
            return scores;
        }

        String input = text.toLowerCase();

        // FOOD
        scores.put("FOOD",
                weightedScore(input,
                        new String[]{
                                "lunch",
                                "dinner",
                                "breakfast",
                                "restaurant",
                                "pizza",
                                "burger",
                                "meal",
                                "cafe",
                                "coffee",
                                "snack"
                        },
                        3,
                        new String[]{
                                "food",
                                "tea"
                        },
                        1));

        // TRANSPORT
        scores.put("TRANSPORT",
                weightedScore(input,
                        new String[]{
                                "uber",
                                "ola",
                                "taxi",
                                "cab",
                                "bus",
                                "train",
                                "metro",
                                "petrol",
                                "fuel",
                                "auto",
                                "flight"
                        },
                        3,
                        new String[]{
                                "travel",
                                "transport",
                                "ride",
                                "trip"
                        },
                        1));

        // EDUCATION
        scores.put("EDUCATION",
                weightedScore(input,
                        new String[]{
                                "tuition",
                                "course",
                                "education",
                                "udemy",
                                "exam fee",
                                "college fee",
                                "school fee",
                                "certificate"
                        },
                        3,
                        new String[]{
                                "college",
                                "school",
                                "book",
                                "study",
                                "textbook"
                        },
                        1));

        // SHOPPING
        scores.put("SHOPPING",
                weightedScore(input,
                        new String[]{
                                "shopping",
                                "purchase",
                                "amazon",
                                "flipkart"
                        },
                        3,
                        new String[]{
                                "shirt",
                                "dress",
                                "clothes",
                                "shoes",
                                "bag"
                        },
                        1));

        // ENTERTAINMENT
        scores.put("ENTERTAINMENT",
                weightedScore(input,
                        new String[]{
                                "movie",
                                "cinema",
                                "netflix",
                                "spotify",
                                "concert",
                                "game"
                        },
                        3,
                        new String[]{
                                "entertainment"
                        },
                        1));

        // HEALTH
        scores.put("HEALTH",
                weightedScore(input,
                        new String[]{
                                "doctor",
                                "hospital",
                                "medicine",
                                "pharmacy",
                                "clinic",
                                "medical"
                        },
                        3,
                        new String[]{
                                "health"
                        },
                        1));

        // BILLS
        scores.put("BILLS",
                weightedScore(input,
                        new String[]{
                                "electricity",
                                "rent",
                                "internet",
                                "wifi",
                                "phone bill",
                                "mobile bill"
                        },
                        3,
                        new String[]{
                                "bill",
                                "recharge",
                                "water bill"
                        },
                        1));

        return scores;
    }
    public CategorySuggestionResponse getSuggestionDetails(String text) {

    Map<String, Integer> scores = calculateScores(text);

    String bestCategory = "OTHER";
    int highestScore = 0;
    int totalScore = 0;

    for (int score : scores.values()) {
        totalScore += score;
    }

    for (Map.Entry<String, Integer> entry : scores.entrySet()) {

        if (entry.getValue() > highestScore) {
            highestScore = entry.getValue();
            bestCategory = entry.getKey();
        }
    }

    int confidence = 0;

    if (totalScore > 0) {
        confidence = Math.round(
                ((float) highestScore / totalScore) * 100
        );
    }

    return new CategorySuggestionResponse(
            bestCategory,
            confidence,
            scores
    );
}
    private int weightedScore(
            String input,
            String[] strongKeywords,
            int strongWeight,
            String[] normalKeywords,
            int normalWeight) {

        int score = 0;

        for (String keyword : strongKeywords) {

            if (input.contains(keyword)) {
                score += strongWeight;
            }
        }

        for (String keyword : normalKeywords) {

            if (input.contains(keyword)) {
                score += normalWeight;
            }
        }

        return score;
    }
}
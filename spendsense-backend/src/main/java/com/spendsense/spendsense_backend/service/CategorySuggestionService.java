package com.spendsense.spendsense_backend.service;

import org.springframework.stereotype.Service;

@Service
public class CategorySuggestionService {

    public String suggestCategory(String text) {

        if (text == null || text.trim().isEmpty()) {
            return "OTHER";
        }

        String input = text.toLowerCase();

        // Food
        if (containsAny(input,
                "food",
                "lunch",
                "dinner",
                "breakfast",
                "restaurant",
                "cafe",
                "coffee",
                "tea",
                "snack",
                "pizza",
                "burger",
                "meal")) {

            return "FOOD";
        }

        // Transport
        if (containsAny(input,
                "uber",
                "ola",
                "bus",
                "train",
                "metro",
                "auto",
                "cab",
                "taxi",
                "petrol",
                "fuel",
                "transport",
                "travel")) {

            return "TRANSPORT";
        }

        // Education
        if (containsAny(input,
                "book",
                "course",
                "college",
                "school",
                "tuition",
                "exam",
                "education",
                "udemy",
                "certificate")) {

            return "EDUCATION";
        }

        // Shopping
        if (containsAny(input,
                "shirt",
                "dress",
                "clothes",
                "shopping",
                "amazon",
                "flipkart",
                "shoes",
                "bag",
                "purchase")) {

            return "SHOPPING";
        }

        // Entertainment
        if (containsAny(input,
                "movie",
                "cinema",
                "netflix",
                "spotify",
                "game",
                "concert",
                "entertainment")) {

            return "ENTERTAINMENT";
        }

        // Health
        if (containsAny(input,
                "medicine",
                "doctor",
                "hospital",
                "pharmacy",
                "health",
                "medical",
                "clinic")) {

            return "HEALTH";
        }

        // Bills
        if (containsAny(input,
                "electricity",
                "water bill",
                "internet",
                "wifi",
                "phone bill",
                "mobile bill",
                "rent",
                "bill",
                "recharge")) {

            return "BILLS";
        }

        return "OTHER";
    }

    private boolean containsAny(
            String input,
            String... keywords) {

        for (String keyword : keywords) {

            if (input.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}
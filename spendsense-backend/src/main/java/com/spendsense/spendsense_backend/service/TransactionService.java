package com.spendsense.spendsense_backend.service;

import com.spendsense.spendsense_backend.entity.Transaction;
import com.spendsense.spendsense_backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import com.spendsense.spendsense_backend.dto.CategorySuggestionResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Create a transaction
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // Get all transactions
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // Get one transaction by ID
    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    // Update a transaction
    public Optional<Transaction> updateTransaction(
            Long id,
            Transaction updatedTransaction
    ) {
        return transactionRepository.findById(id)
                .map(existingTransaction -> {

                    existingTransaction.setTitle(
                            updatedTransaction.getTitle()
                    );

                    existingTransaction.setAmount(
                            updatedTransaction.getAmount()
                    );

                    existingTransaction.setType(
                            updatedTransaction.getType()
                    );

                    existingTransaction.setCategory(
                            updatedTransaction.getCategory()
                    );

                    existingTransaction.setDescription(
                            updatedTransaction.getDescription()
                    );

                    existingTransaction.setDate(
                            updatedTransaction.getDate()
                    );

                    return transactionRepository.save(
                            existingTransaction
                    );
                });
    }

    // Delete a transaction
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
    public CategorySuggestionResponse getCategorySuggestionDetails(
        String title,
        String description) {

    String text = ((title == null ? "" : title) + " "
            + (description == null ? "" : description))
            .toLowerCase();

    List<String> matchedKeywords = new ArrayList<>();

    String category = "OTHER";
    double confidence = 0.20;
    String reason = "No strong category keywords were detected.";

    // FOOD
    String[] foodKeywords = {
        "food", "lunch", "dinner", "breakfast", "snack",
        "restaurant", "cafe", "coffee", "pizza", "meal",
        "canteen", "swiggy", "zomato"
    };

    // TRANSPORT
    String[] transportKeywords = {
        "bus", "train", "taxi", "cab", "uber", "ola",
        "metro", "travel", "transport", "fuel", "petrol",
        "diesel", "auto", "flight", "ticket"
    };

    // EDUCATION
    String[] educationKeywords = {
        "tuition", "course", "book", "books", "exam",
        "college fee", "school fee", "education",
        "class", "udemy", "coursera", "nptel"
    };

    // SHOPPING
    String[] shoppingKeywords = {
        "shopping", "clothes", "shirt", "dress", "shoes",
        "amazon", "flipkart", "purchase", "mall"
    };

    // ENTERTAINMENT
    String[] entertainmentKeywords = {
        "movie", "cinema", "netflix", "concert", "game",
        "gaming", "entertainment", "spotify"
    };

    // HEALTH
    String[] healthKeywords = {
        "doctor", "hospital", "medicine", "medical",
        "pharmacy", "health", "clinic", "dental"
    };

    // BILLS
    String[] billKeywords = {
        "electricity", "water bill", "internet", "wifi",
        "mobile bill", "rent", "bill", "recharge"
    };

    int maxMatches = 0;

    String[][] categories = {
        foodKeywords,
        transportKeywords,
        educationKeywords,
        shoppingKeywords,
        entertainmentKeywords,
        healthKeywords,
        billKeywords
    };

    String[] categoryNames = {
        "FOOD",
        "TRANSPORT",
        "EDUCATION",
        "SHOPPING",
        "ENTERTAINMENT",
        "HEALTH",
        "BILLS"
    };

    for (int i = 0; i < categories.length; i++) {

        int matches = 0;

        for (String keyword : categories[i]) {
            if (text.contains(keyword)) {
                matches++;
            }
        }

        if (matches > maxMatches) {
            maxMatches = matches;
            category = categoryNames[i];
        }
    }

    // Collect keywords from the winning category
    String[] winningKeywords = null;

    switch (category) {
        case "FOOD":
            winningKeywords = foodKeywords;
            break;
        case "TRANSPORT":
            winningKeywords = transportKeywords;
            break;
        case "EDUCATION":
            winningKeywords = educationKeywords;
            break;
        case "SHOPPING":
            winningKeywords = shoppingKeywords;
            break;
        case "ENTERTAINMENT":
            winningKeywords = entertainmentKeywords;
            break;
        case "HEALTH":
            winningKeywords = healthKeywords;
            break;
        case "BILLS":
            winningKeywords = billKeywords;
            break;
        default:
            winningKeywords = new String[0];
    }

    for (String keyword : winningKeywords) {
        if (text.contains(keyword)) {
            matchedKeywords.add(keyword);
        }
    }

    if (maxMatches > 0) {
        confidence = Math.min(0.50 + (maxMatches * 0.15), 0.95);

        reason = "Detected "
                + matchedKeywords.size()
                + " keyword"
                + (matchedKeywords.size() == 1 ? "" : "s")
                + " associated with "
                + category.toLowerCase()
                + ".";
    }

    return new CategorySuggestionResponse(
            category,
            confidence,
            matchedKeywords,
            reason
    );
}
}
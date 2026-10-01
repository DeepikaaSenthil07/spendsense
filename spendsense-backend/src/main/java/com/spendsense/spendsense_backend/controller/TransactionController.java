package com.spendsense.spendsense_backend.controller;

import com.spendsense.spendsense_backend.dto.CategorySuggestionResponse;
import com.spendsense.spendsense_backend.entity.Transaction;
import com.spendsense.spendsense_backend.service.TransactionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Create a transaction
    @PostMapping
    public Transaction createTransaction(
            @RequestBody Transaction transaction) {

        return transactionService.createTransaction(transaction);
    }

    // Get all transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {

        return transactionService.getAllTransactions();
    }

    // Get one transaction by ID
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(
            @PathVariable Long id) {

        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a transaction
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long id,
            @RequestBody Transaction transaction) {

        return transactionService.updateTransaction(id, transaction)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id) {

        transactionService.deleteTransaction(id);

        return ResponseEntity.noContent().build();
    }

    // Basic category suggestion
    @GetMapping("/suggest-category")
    public String suggestCategory(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description) {

        return transactionService.suggestCategory(title, description);
    }

    // Detailed category suggestion with confidence and explanation
    @GetMapping("/suggest-category-details")
    public CategorySuggestionResponse suggestCategoryDetails(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description) {

        return transactionService.getCategorySuggestionDetails(
                title,
                description
        );
    }
}
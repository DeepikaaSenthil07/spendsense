package com.spendsense.spendsense_backend.service;

import com.spendsense.spendsense_backend.entity.Transaction;
import com.spendsense.spendsense_backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

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
}
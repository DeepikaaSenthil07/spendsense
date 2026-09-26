package com.spendsense.spendsense_backend.repository;

import com.spendsense.spendsense_backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
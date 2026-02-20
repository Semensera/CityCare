package com.citycare.repository;

import com.citycare.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    // Тут поки що порожньо, бо JpaRepository вже має всі базові методи
    // (save, findAll, findById, deleteById) під капотом!
}
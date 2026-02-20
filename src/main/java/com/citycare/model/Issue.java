package com.citycare.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "issues")
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Унікальний номер проблеми в базі

    @Column(nullable = false)
    private String category; // Категорія (Яма, Сміття тощо)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // Детальний опис від користувача

    @Column(nullable = false)
    private Double latitude; // Широта (координата на карті)

    @Column(nullable = false)
    private Double longitude; // Довгота (координата на карті)

    @Column(nullable = false)
    private String status = "НОВА"; // Статус виконання
    @Column(columnDefinition = "TEXT") // TEXT для збереження великого обсягу даних (фото)
    private String photoBase64; 

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
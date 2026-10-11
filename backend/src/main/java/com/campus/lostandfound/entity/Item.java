package com.campus.lostandfound.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "item_type", nullable = false)
    private String itemType; // "LOST", "FOUND"

    @Column(name = "category", nullable = false)
    private String category; // "ELECTRONICS", "ID_CARD", "BOOKS", "KEYS", "OTHER"

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "date_reported", nullable = false)
    private LocalDate dateReported;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "status", nullable = false)
    private String status; // "ACTIVE", "RESOLVED"
}

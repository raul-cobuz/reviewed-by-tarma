package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.ReviewResponseDTO;
import org.example.model.Review;
import org.example.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;


    @GetMapping
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewService.getAllReviewsFormatted();
    }

    @GetMapping("/masterpieces")
    public List<Review> getTopReviews() {
        return reviewService.getMasterpieces();
    }

    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody Review review) {
        try {
            Review savedReview = reviewService.saveReview(review);
            return ResponseEntity.ok(savedReview);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok().body("Recenzia a fost ștearsă cu succes, curățenie la locul de muncă!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
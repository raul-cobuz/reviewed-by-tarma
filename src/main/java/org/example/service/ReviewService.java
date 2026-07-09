package org.example.service;

import org.example.dto.ReviewResponseDTO;
import org.example.model.Review;
import org.example.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;


    public List<Review> getMasterpieces() {
        return reviewRepository.findByRating(10);
    }


    public Review saveReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 10) {
            throw new IllegalArgumentException("Rating-ul trebuie să fie între 1 și 10! Tu ai dat: " + review.getRating());
        }


        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Recenzia cu ID-ul " + id + " nu există și nu a putut fi ștearsă.");
        }
    }

    private ReviewResponseDTO convertToDTO(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        dto.setRating(review.getRating());


        dto.setAlbumTitle(review.getAlbum().getTitle());
        dto.setArtistName(review.getAlbum().getArtist().getName());
        return dto;
    }


    public List<ReviewResponseDTO> getAllReviewsFormatted() {
        List<Review> reviews = reviewRepository.findAll();

        return reviews.stream().map(review -> {
            ReviewResponseDTO dto = new ReviewResponseDTO();


            dto.setId(review.getId());
            dto.setTitle(review.getTitle());
            dto.setContent(review.getContent());
            dto.setSummary(review.getSummary());
            dto.setRating(review.getRating());
            dto.setCategory(review.getCategory());
            dto.setAudioUrl(review.getAudioUrl());

            if (review.getArtistName() != null) {
                dto.setArtistName(review.getArtistName());
            } else if (review.getAlbum() != null && review.getAlbum().getArtist() != null) {
                dto.setArtistName(review.getAlbum().getArtist().getName());
            } else {
                dto.setArtistName("Artist Necunoscut");
            }


            if (review.getAlbum() != null) {
                dto.setAlbumTitle(review.getAlbum().getTitle());
            } else {
                dto.setAlbumTitle(review.getTitle());
            }

            dto.setCoverUrl(review.getCoverUrl());
            return dto;
        }).toList();
    }

    public Review updateReview(Long id, Review reviewDetails) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nu am găsit recenzia cu ID-ul " + id));
        review.setTitle(reviewDetails.getTitle());
        review.setArtistName(reviewDetails.getArtistName());
        review.setSummary(reviewDetails.getSummary());
        review.setContent(reviewDetails.getContent());
        review.setRating(reviewDetails.getRating());
        if (reviewDetails.getCoverUrl() != null) {
            review.setCoverUrl(reviewDetails.getCoverUrl());
        }
        if (reviewDetails.getCategory() != null) {
            review.setCategory(reviewDetails.getCategory());
        }
        if (reviewDetails.getAudioUrl() != null) {
            review.setAudioUrl(reviewDetails.getAudioUrl());
        }

        return reviewRepository.save(review);
    }
}
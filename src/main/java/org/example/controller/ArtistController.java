package org.example.controller;

import org.example.model.Artist;
import org.example.repository.ArtistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {


    @Autowired
    private ArtistRepository artistRepository;


    @GetMapping
    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }


    @PostMapping
    public Artist createArtist(@RequestBody Artist artist) {
        return artistRepository.save(artist);
    }
}
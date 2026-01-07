package br.com.oracle.sentiment_api.controller;

import br.com.oracle.sentiment_api.dto.SentimentRequest;
import br.com.oracle.sentiment_api.dto.SentimentResponse;
import br.com.oracle.sentiment_api.service.SentimentService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sentiment")
public class SentimentController {

    private final SentimentService service;

    public SentimentController(SentimentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SentimentResponse> analyze(
            @RequestBody @Valid SentimentRequest request
    ) {
        SentimentResponse response = service.analyze(request);
        return ResponseEntity.ok(response);
    }
}

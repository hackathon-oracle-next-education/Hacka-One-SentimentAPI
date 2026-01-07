package br.com.oracle.sentiment_api.service;

import br.com.oracle.sentiment_api.dto.SentimentRequest;
import br.com.oracle.sentiment_api.dto.SentimentResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SentimentService {

    private final RestTemplate restTemplate = new RestTemplate();

    // quando rodar localmente
    private final String DS_API_URL = "http://localhost:8000/predict";

    public SentimentResponse analyze(SentimentRequest request) {

        Map<String, String> payload = Map.of(
                "text", request.text()
        );

        return restTemplate.postForObject(
                DS_API_URL,
                payload,
                SentimentResponse.class
        );
    }
}


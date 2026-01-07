package br.com.oracle.sentiment_api.dto;

public record SentimentResponse(
        String previsao,
        Double probabilidade
) {}

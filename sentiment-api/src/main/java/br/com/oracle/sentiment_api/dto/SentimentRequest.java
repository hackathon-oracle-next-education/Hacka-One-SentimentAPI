package br.com.oracle.sentiment_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SentimentRequest(

        @NotBlank(message = "O texto é obrigatório")
        @Size(min = 5, message = "O texto deve ter pelo menos 5 caracteres")
        String text
) {}


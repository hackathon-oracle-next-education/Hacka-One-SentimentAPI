# Hacka-One-SentimentAPI


API de análise de sentimentos desenvolvida como um MVP para classificar automaticamente
avaliações e comentários de clientes em **Positivo** ou **Negativo**, retornando também
a **probabilidade da predição**.

O projeto integra **Data Science (Python)** e **Back-end (Java com Spring Boot)**,
simulando um cenário real de microserviços amplamente utilizado em empresas.

---

## 📌 Problema de Negócio

Empresas que recebem grande volume de comentários e avaliações de clientes
enfrentam dificuldades para:

- Ler manualmente todas as mensagens;
- Identificar rapidamente reclamações e elogios;
- Priorizar atendimentos críticos;
- Medir a satisfação do cliente ao longo do tempo.

---

## 💡 Solução Proposta

Desenvolvimento de uma API que:
- Recebe textos de avaliações de clientes;
- Classifica automaticamente o sentimento;
- Retorna o resultado em formato JSON;
- Pode ser consumida por diferentes aplicações.

---

## 🧠 Visão Geral da Arquitetura

Cliente (Postman / cURL/ Front-end) -->

Spring Boot API (Java) -->

Microserviço de Data Science (FastAPI / Python) -->

Modelo de Machine Learning (TF-IDF + Logistic Regression)

---

## 📊 Data Science

### Dataset
- **Brazilian E-Commerce Public Dataset by Olist**
- Fonte: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce

### Estratégia de Rotulagem
- Notas **4 e 5** → Positivo
- Notas **1 e 2** → Negativo
- Nota **3** → descartada (fora do escopo do MVP)

### Modelo Utilizado
- Vetorização de texto: **TF-IDF**
- Algoritmo de classificação: **Logistic Regression**
- Linguagem: **Python**
- Biblioteca principal: **scikit-learn**

### Avaliação
Foram utilizadas métricas como:
- Accuracy
- Precision
- Recall
- F1-score

Os resultados obtidos são satisfatórios para um MVP funcional.

---

## 🔧 Microserviço de Data Science (Python)

- Framework: **FastAPI**
- Responsável por carregar o modelo treinado e realizar a predição.

### Endpoint

POST /predict

### Exemplo de Entrada

{

"text": "Entrega rápida e produto excelente"

}

### Exemplo de Saída
{

"previsao": "Positivo",

"probabilidade": 0.98

}

---

## ☕ Back-end (Spring Boot)

- Linguagem: **Java**
- Framework: **Spring Boot**
- Funções principais:

  - Validação dos dados de entrada;

  - Consumo do microserviço de Data Science;

  - Retorno da resposta final ao cliente.

### Endpoint Principal

POST /sentiment

### Exemplo de Requisição
{

"text": "Entrega rápida e produto excelente"

}

### Exemplo de Resposta
{

"previsao": "Positivo",

"probabilidade": 0.99

}

___

## ✅ Validações e Tratamento de Erros

- Campo text obrigatório;

- Tamanho mínimo de caracteres;

- Mensagens de erro amigáveis;

- Tratamento global de exceções.

___

## ▶️ Como Executar o Projeto
### 1️⃣ Microserviço de Data Science
python -m uvicorn app:app --reload

Disponível em:

http://localhost:8000

### 2️⃣ Back-end Spring Boot
Execute a aplicação pela IDE (IntelliJ) ou via terminal:

mvn spring-boot:run

Disponível em:

http://localhost:8080

___

## 🧪 Testes
Exemplo de teste usando cURL:

curl -X POST http://localhost:8080/sentiment \
-H "Content-Type: application/json" \
-d '{"text":"Entrega rápida e produto excelente"}'

___

## 🚀 Tecnologias Utilizadas
- Java 17

- Spring Boot

- Python 3

- FastAPI

- scikit-learn

- Pandas

- Joblib

- Git & GitHub

___

## 📌 Possíveis Evoluções

___

## 👩‍💻 Autores

___

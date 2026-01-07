/**
 * Módulo principal da UI de Análise de Sentimento
 */
const SentimentUI = (function() {
    // Configuração da API
    const API_BASE_URL = 'http://localhost:8080';
    const API_ENDPOINT = '/sentiment';

    // Estado da aplicação
    let analysisHistory = [];
    let isConnected = false;

    // Cache de elementos DOM
    const elements = {
        textInput: document.getElementById('textInput'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        resultSection: document.getElementById('resultSection'),
        loading: document.getElementById('loading'),
        errorMessage: document.getElementById('errorMessage'),
        charCount: document.getElementById('charCount'),
        sentimentIcon: document.getElementById('sentimentIcon'),
        sentimentLabel: document.getElementById('sentimentLabel'),
        probabilityValue: document.getElementById('probabilityValue'),
        progressFill: document.getElementById('progressFill'),
        confidenceValue: document.getElementById('confidenceValue'),
        historyList: document.getElementById('historyList'),
        apiStatusIcon: document.getElementById('apiStatusIcon'),
        apiStatusText: document.getElementById('apiStatusText')
    };

    /**
     * Inicializa a aplicação
     */
    function init() {
        setupEventListeners();
        loadHistory();
        checkApiConnection();
        updateCharCount();

        // Exemplo de histórico inicial
        if (analysisHistory.length === 0) {
            analysisHistory = [
                {
                    id: Date.now() - 10000,
                    text: 'Este produto é incrível e superou minhas expectativas!',
                    fullText: 'Este produto é incrível e superou minhas expectativas!',
                    sentiment: 'positivo',
                    probability: 0.92,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                },
                {
                    id: Date.now() - 20000,
                    text: 'Não gostei do atendimento, muito demorado...',
                    fullText: 'Não gostei do atendimento, muito demorado e pouco eficiente.',
                    sentiment: 'negativo',
                    probability: 0.78,
                    timestamp: new Date(Date.now() - 600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                }
            ];
            updateHistoryDisplay();
        }

        // Exemplo automático no campo de texto
        setTimeout(() => {
            if (!elements.textInput.value) {
                elements.textInput.value = "Estou muito satisfeito com o serviço, tudo funcionou perfeitamente!";
                updateCharCount();
            }
        }, 1000);
    }

    /**
     * Configura os event listeners
     */
    function setupEventListeners() {
        // Análise com Ctrl+Enter
        elements.textInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                analyzeSentiment();
            }
        });

        // Verificar conexão periodicamente
        setInterval(checkApiConnection, 30000);
    }

    /**
     * Atualiza o contador de caracteres
     */
    function updateCharCount() {
        const length = elements.textInput.value.length;
        elements.charCount.textContent = `${length} caracteres`;

        if (length < 5) {
            elements.charCount.classList.add('error');
            elements.analyzeBtn.disabled = true;
        } else {
            elements.charCount.classList.remove('error');
            elements.analyzeBtn.disabled = false;
        }
    }

    /**
     * Verifica a conexão com a API
     */
    async function checkApiConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/actuator/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }).catch(() => null);

            if (response && response.ok) {
                setApiStatus(true, 'Conectado à API');
            } else {
                // Tenta endpoint padrão se actuator não estiver disponível
                await fetch(API_BASE_URL).then(() => {
                    setApiStatus(true, 'Conectado à API');
                }).catch(() => {
                    setApiStatus(false, 'API não disponível');
                });
            }
        } catch {
            setApiStatus(false, 'API não disponível');
        }
    }

    /**
     * Define o status da API
     */
    function setApiStatus(connected, message) {
        isConnected = connected;
        elements.apiStatusIcon.className = connected ? 'fas fa-circle connected' : 'fas fa-circle disconnected';
        elements.apiStatusText.textContent = message;
        elements.apiStatusText.style.color = connected ? '#10b981' : '#ef4444';
    }

    /**
     * Analisa o sentimento do texto
     */
    async function analyzeSentiment() {
        const text = elements.textInput.value.trim();

        // Validação
        if (text.length < 5) {
            showError('O texto deve ter pelo menos 5 caracteres');
            return;
        }

        if (!isConnected) {
            showError('Não foi possível conectar à API. Verifique se o servidor está rodando.');
            return;
        }

        // Mostrar loading
        elements.loading.classList.add('show');
        hideError();
        elements.resultSection.classList.remove('show');

        try {
            // Fazer requisição
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });

            // Verificar resposta
            if (!response.ok) {
                let errorMsg = `Erro ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.erro || errorMsg;
                } catch {
                    errorMsg = `${errorMsg}: ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            // Validar estrutura da resposta
            if (!data.previsao || data.probabilidade === undefined) {
                throw new Error('Resposta da API em formato inválido');
            }

            // Processar resultado
            displayResult(data);
            addToHistory(text, data);

        } catch (error) {
            showError(error.message);
        } finally {
            elements.loading.classList.remove('show');
        }
    }

    /**
     * Exibe o resultado da análise
     */
    function displayResult(data) {
        const sentiment = data.previsao.toLowerCase();
        const probability = data.probabilidade * 100;

        // Atualizar ícone e labels
        const icon = elements.sentimentIcon;
        const label = elements.sentimentLabel;

        icon.innerHTML = sentiment === 'positivo'
            ? '<i class="fas fa-smile-beam"></i>'
            : '<i class="fas fa-frown"></i>';

        icon.className = `sentiment-icon ${sentiment}`;
        label.textContent = sentiment.toUpperCase();
        label.className = `sentiment-label ${sentiment}`;

        // Atualizar valores
        elements.confidenceValue.textContent = `${Math.round(probability)}%`;
        elements.probabilityValue.textContent = `${Math.round(probability)}%`;

        // Animar barra de progresso
        setTimeout(() => {
            animateProgressBar(probability, sentiment);
        }, 100);

        // Mostrar resultados
        elements.resultSection.classList.add('show');

        // Rolar para os resultados
        elements.resultSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * Anima a barra de progresso
     */
    function animateProgressBar(targetPercentage, sentiment) {
        let current = 0;
        const increment = targetPercentage / 50; // 50 frames para a animação

        function animate() {
            if (current < targetPercentage) {
                current += increment;
                if (current > targetPercentage) current = targetPercentage;

                elements.progressFill.style.width = `${current}%`;
                elements.probabilityValue.textContent = `${Math.round(current)}%`;

                // Atualizar cor
                elements.progressFill.className = `progress-fill ${sentiment}`;

                requestAnimationFrame(animate);
            }
        }

        animate();
    }

    /**
     * Adiciona análise ao histórico
     */
    function addToHistory(text, data) {
        const historyItem = {
            id: Date.now(),
            text: text.length > 50 ? text.substring(0, 50) + '...' : text,
            fullText: text,
            sentiment: data.previsao.toLowerCase(),
            probability: data.probabilidade,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        // Adicionar no início
        analysisHistory.unshift(historyItem);

        // Manter apenas últimos 10 itens
        if (analysisHistory.length > 10) {
            analysisHistory = analysisHistory.slice(0, 10);
        }

        // Salvar no localStorage
        saveHistory();

        // Atualizar display
        updateHistoryDisplay();
    }

    /**
     * Atualiza a exibição do histórico
     */
    function updateHistoryDisplay() {
        elements.historyList.innerHTML = '';

        analysisHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.setAttribute('data-full-text', item.fullText);

            const icon = item.sentiment === 'positivo'
                ? '<i class="fas fa-smile"></i>'
                : '<i class="fas fa-frown"></i>';

            div.innerHTML = `
                <div class="history-text">
                    <span class="time">${item.timestamp}</span> - ${item.text}
                </div>
                <div class="history-sentiment ${item.sentiment === 'positivo' ? 'history-positive' : 'history-negative'}">
                    ${icon} ${item.sentiment === 'positivo' ? 'Positivo' : 'Negativo'}
                    (${Math.round(item.probability * 100)}%)
                </div>
            `;

            // Adicionar evento de clique para reutilizar texto
            div.addEventListener('click', () => {
                elements.textInput.value = item.fullText;
                updateCharCount();
                elements.textInput.focus();
            });

            elements.historyList.appendChild(div);
        });
    }

    /**
     * Salva o histórico no localStorage
     */
    function saveHistory() {
        try {
            localStorage.setItem('sentimentAnalysisHistory', JSON.stringify(analysisHistory));
        } catch (e) {
            console.warn('Não foi possível salvar o histórico:', e);
        }
    }

    /**
     * Carrega o histórico do localStorage
     */
    function loadHistory() {
        try {
            const saved = localStorage.getItem('sentimentAnalysisHistory');
            if (saved) {
                analysisHistory = JSON.parse(saved);
                updateHistoryDisplay();
            }
        } catch (e) {
            console.warn('Não foi possível carregar o histórico:', e);
        }
    }

    /**
     * Exibe mensagem de erro
     */
    function showError(message) {
        elements.errorMessage.textContent = `Erro: ${message}`;
        elements.errorMessage.classList.add('show');

        // Auto-esconder após 5 segundos
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    /**
     * Esconde mensagem de erro
     */
    function hideError() {
        elements.errorMessage.classList.remove('show');
    }

    /**
     * Limpa o histórico
     */
    function clearHistory() {
        if (confirm('Tem certeza que deseja limpar o histórico?')) {
            analysisHistory = [];
            updateHistoryDisplay();
            localStorage.removeItem('sentimentAnalysisHistory');
        }
    }

    /**
     * Exporta o histórico como JSON
     */
    function exportHistory() {
        const dataStr = JSON.stringify(analysisHistory, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'historico-analise-sentimento.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Retorna a API pública do módulo
    return {
        init,
        analyzeSentiment,
        updateCharCount,
        clearHistory,
        exportHistory
    };
})();

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', SentimentUI.init);

// Expor para uso no HTML (se necessário)
window.SentimentUI = SentimentUI;
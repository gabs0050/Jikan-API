// personagens.js - Versão corrigida e completa
import { searchAnime } from './apiService.js';

// Configurações
const API_BASE_URL = 'https://api.jikan.moe/v4';
const SEARCH_DELAY = 500; // ms
const MAX_POPULAR_CHARACTERS = 12;
const MAX_SEARCH_RESULTS = 5;

// Cache simples
const cache = {
    popularCharacters: null,
    searchResults: {}
};

// Função principal que inicializa a página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        setActiveLink();
        setupEventListeners();
        setupAnimeSearch(); // Configura a pesquisa de animes no cabeçalho
        await loadPopularCharacters();
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Ocorreu um erro ao carregar. Recarregue a página.');
    }
});

// Configura os event listeners para pesquisa de personagens
function setupEventListeners() {
    const searchInput = document.getElementById('pesquisarPersonagem');
    const searchButton = document.getElementById('botaoPesquisar');
    const searchResults = document.getElementById('character-search-results');

    // Pesquisa com debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length > 1) {
                searchCharacters(query);
            } else {
                searchResults.style.display = 'none';
            }
        }, SEARCH_DELAY);
    });

    // Pesquisa ao clicar no botão
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchCharacters(query);
        }
    });

    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.character-search-box') && 
            !e.target.closest('#character-search-results')) {
            searchResults.style.display = 'none';
        }
    });
}

// Configura a pesquisa de animes (no cabeçalho)
function setupAnimeSearch() {
    const searchInput = document.getElementById('pesquisarAnime');
    const searchBox = document.querySelector('.box');
    
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                performAnimeSearch(query);
            } else {
                const results = document.getElementById('search-results');
                if (results) results.remove();
            }
        }, SEARCH_DELAY);
    });
    
    searchBox.addEventListener('click', () => {
        searchInput.focus();
    });
}

// Executa a pesquisa de animes
async function performAnimeSearch(query) {
    try {
        const animes = await searchAnime(query);
        displayAnimeResults(animes);
    } catch (error) {
        console.error('Erro na pesquisa de animes:', error);
    }
}

// Exibe os resultados da pesquisa de animes
function displayAnimeResults(animes) {
    const oldResults = document.getElementById('search-results');
    if (oldResults) oldResults.remove();
    
    if (!animes || animes.length === 0) {
        return;
    }
    
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.backgroundColor = 'white';
    resultsContainer.style.width = '100%';
    resultsContainer.style.maxHeight = '400px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.borderRadius = '0 0 10px 10px';
    
    animes.forEach(anime => {
        const animeElement = document.createElement('div');
        animeElement.style.padding = '10px';
        animeElement.style.borderBottom = '1px solid #eee';
        animeElement.style.cursor = 'pointer';
        animeElement.style.display = 'flex';
        animeElement.style.alignItems = 'center';
        
        animeElement.innerHTML = `
            <img src="${anime.images?.jpg?.image_url || ''}" 
                 alt="${anime.title}" 
                 style="width: 50px; height: 70px; object-fit: cover; margin-right: 10px;">
            <div>
                <h3 style="margin: 0; color: #23428A;">${anime.title}</h3>
                <p style="margin: 5px 0 0; color: #666; font-size: 14px;">
                    ${anime.type} • ${anime.episodes || '?'} episódios • ${anime.status}
                </p>
            </div>
        `;
        
        animeElement.addEventListener('click', () => {
            window.location.href = `anime-details.html?id=${anime.mal_id}`;
        });
        
        resultsContainer.appendChild(animeElement);
    });
    
    const searchBox = document.querySelector('.box');
    searchBox.appendChild(resultsContainer);
}

// Carrega personagens populares
async function loadPopularCharacters() {
    const grid = document.getElementById('popular-characters-grid');
    
    try {
        // Exibe loading
        grid.innerHTML = '<div class="loading">Carregando...</div>';
        
        const response = await fetch(
            `${API_BASE_URL}/top/characters?limit=${MAX_POPULAR_CHARACTERS}`
        );
        
        if (!response.ok) throw new Error('Erro na API');
        
        const data = await response.json();
        renderPopularCharacters(data.data || []);
    } catch (error) {
        console.error('Erro:', error);
        grid.innerHTML = `
            <div class="error">
                Falha ao carregar. 
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
    }
}

// Pesquisa personagens
async function searchCharacters(query) {
    const resultsContainer = document.getElementById('character-search-results');
    
    try {
        // Exibe loading
        resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';
        resultsContainer.style.display = 'block';
        
        const response = await fetch(
            `${API_BASE_URL}/characters?q=${encodeURIComponent(query)}&limit=${MAX_SEARCH_RESULTS}`
        );
        
        if (!response.ok) throw new Error('Erro na pesquisa');
        
        const data = await response.json();
        displaySearchResults(data.data || []);
    } catch (error) {
        console.error('Erro:', error);
        resultsContainer.innerHTML = '<div class="error">Erro na pesquisa</div>';
    }
}

// Exibe resultados da pesquisa de personagens
function displaySearchResults(characters) {
    const resultsContainer = document.getElementById('character-search-results');
    
    if (characters.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Nenhum resultado</div>';
        return;
    }

    resultsContainer.innerHTML = characters.map(char => `
        <div class="search-result-item" onclick="openCharacterDetails(${char.mal_id})">
            <img src="${char.images?.jpg?.image_url || ''}" 
                 alt="${char.name}"
                 onerror="this.src='./img/default-character.jpg'">
            <div>
                <h3>${char.name}</h3>
                <p>${(char.about || '').substring(0, 100)}...</p>
            </div>
        </div>
    `).join('');
}

// Exibe personagens populares
function renderPopularCharacters(characters) {
    const grid = document.getElementById('popular-characters-grid');
    
    grid.innerHTML = characters.map(char => `
        <div class="character-card" onclick="openCharacterDetails(${char.mal_id})">
            <img src="${char.images?.jpg?.image_url || ''}" 
                 alt="${char.name}"
                 onerror="this.src='./img/default-character.jpg'">
            <div class="character-info">
                <h3>${char.name}</h3>
                ${char.name_kanji ? `<p>${char.name_kanji}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Abre página de detalhes do personagem
function openCharacterDetails(characterId) {
    window.location.href = `character-details.html?id=${characterId}`;
}

// Define link ativo no menu
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('ativo');
        const linkPage = link.getAttribute('href').split('/').pop().toLowerCase();
        if (linkPage === currentPage) {
            link.classList.add('ativo');
        }
    });
}

// Mostra mensagem de erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.innerHTML = `
        <p>${message}</p>
        <button onclick="location.reload()">Recarregar</button>
    `;
    document.body.prepend(errorDiv);
}

// Adiciona funções ao escopo global para acesso via HTML
window.openCharacterDetails = openCharacterDetails;
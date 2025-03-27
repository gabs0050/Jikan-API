'use strict';

import { searchAnime, getTopAnimes } from '../js/apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
    setActiveLink();
    setupSearch();
    await loadPopularAnimes();
});

// Configurações
const MAX_POPULAR_ANIMES = 12;
const MAX_SEARCH_RESULTS = 5;

// Função para destacar link ativo
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('ativo');
        const linkPage = link.getAttribute('href').split('/').pop().toLowerCase();
        
        if (linkPage === currentPage) {
            link.classList.add('ativo');
        }
    });
}

// Configura a pesquisa
function setupSearch() {
    const searchInput = document.getElementById('anime-search-input');
    const searchButton = document.getElementById('anime-search-button');
    const searchResults = document.getElementById('anime-search-results');

    // Pesquisa ao digitar (com debounce)
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchAnimes(query);
            } else {
                searchResults.style.display = 'none';
            }
        }, 500);
    });

    // Pesquisa ao clicar no botão
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchAnimes(query);
        }
    });

    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.anime-search-box') && 
            !e.target.closest('#anime-search-results')) {
            searchResults.style.display = 'none';
        }
    });
}

// Pesquisa animes
async function searchAnimes(query) {
    const resultsContainer = document.getElementById('anime-search-results');
    
    try {
        resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';
        resultsContainer.style.display = 'block';
        
        const animes = await searchAnime(query, MAX_SEARCH_RESULTS);
        displaySearchResults(animes);
    } catch (error) {
        console.error('Erro:', error);
        resultsContainer.innerHTML = '<div class="error">Erro na pesquisa</div>';
    }
}

// Exibe resultados da pesquisa
function displaySearchResults(animes) {
    const resultsContainer = document.getElementById('anime-search-results');
    
    if (animes.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Nenhum anime encontrado</div>';
        return;
    }

    resultsContainer.innerHTML = animes.map(anime => `
        <div class="search-result-item" onclick="openAnimeDetails(${anime.mal_id})">
            <img src="${anime.images?.jpg?.image_url || '../src/img/default-anime.jpg'}" 
                 alt="${anime.title}"
                 onerror="this.src='../src/img/default-anime.jpg'">
            <div>
                <h3>${anime.title}</h3>
                <p>${anime.type} • ${anime.episodes || '?'} episódios</p>
            </div>
        </div>
    `).join('');
}

// Carrega animes populares
async function loadPopularAnimes() {
    const grid = document.getElementById('popular-animes-grid');
    
    try {
        grid.innerHTML = '<div class="loading">Carregando...</div>';
        
        const animes = await getTopAnimes(MAX_POPULAR_ANIMES);
        renderPopularAnimes(animes);
    } catch (error) {
        console.error('Erro:', error);
        grid.innerHTML = `
            <div class="error">
                Falha ao carregar. 
                <button onclick="loadPopularAnimes()">Tentar novamente</button>
            </div>
        `;
    }
}

// Exibe animes populares
function renderPopularAnimes(animes) {
    const grid = document.getElementById('popular-animes-grid');
    
    grid.innerHTML = animes.map(anime => `
        <div class="anime-card" onclick="openAnimeDetails(${anime.mal_id})">
            <img src="${anime.images?.jpg?.image_url || '../src/img/default-anime.jpg'}" 
                 alt="${anime.title}"
                 onerror="this.src='../src/img/default-anime.jpg'">
            <div class="anime-info">
                <h3>${anime.title}</h3>
                <p>${anime.score || 'N/A'}/10</p>
            </div>
        </div>
    `).join('');
}

// Abre página de detalhes
function openAnimeDetails(animeId) {
    window.location.href = `anime-details.html?id=${animeId}`;
}

// Adiciona funções ao escopo global para acesso via HTML
window.openAnimeDetails = openAnimeDetails;
window.loadPopularAnimes = loadPopularAnimes;
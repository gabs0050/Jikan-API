'use strict'
import { searchAnime } from '../js/apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    
    if (!animeId) {
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
        const data = await response.json();
        displayAnimeDetails(data.data);
    } catch (error) {
        console.error('Error fetching anime details:', error);
        document.getElementById('anime-details-container').innerHTML = `
            <div class="error">
                <h2>Erro ao carregar detalhes</h2>
                <p>${error.message}</p>
                <a href="../index.html">Voltar</a>
            </div>
        `;
    }
});

function displayAnimeDetails(anime) {
    const container = document.getElementById('anime-details-container');
    container.innerHTML = `
        <div class="anime-detail">
            <img src="${anime.images?.jpg?.large_image_url}" 
                 alt="${anime.title}" 
                 class="anime-poster">
            <div class="anime-info">
                <h1>${anime.title}</h1>
                <p><strong>Tipo:</strong> ${anime.type}</p>
                <p><strong>Episódios:</strong> ${anime.episodes || 'N/A'}</p>
                <p><strong>Status:</strong> ${anime.status}</p>
                <p><strong>Pontuação:</strong> ${anime.score || 'N/A'}</p>
                <p><strong>Estúdios:</strong> ${anime.studios?.map(s => s.name).join(', ') || 'N/A'}</p>
                <p><strong>Gêneros:</strong> ${anime.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
                <div class="synopsis">
                    <h3>Sinopse</h3>
                    <p>${anime.synopsis || 'Sinopse não disponível.'}</p>
                </div>
            </div>
        </div>
    `;
}

function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('ativo');
        let linkPage = link.getAttribute('href').split('/').pop().toLowerCase();
        
        const isHomePage = currentPage === '' || 
                          currentPage === 'home.html' || 
                          currentPage === 'index.html';
        
        const isHomeLink = linkPage === '' || 
                         linkPage === 'home.html' || 
                         linkPage === 'index.html';
        
        if ((linkPage === currentPage) || (isHomePage && isHomeLink)) {
            link.classList.add('ativo');
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('pesquisarAnime');
    const searchBox = document.querySelector('.box');
    
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                performSearch(query);
            }
        }, 500);
    });
    
    searchBox.addEventListener('click', () => {
        searchInput.focus();
    });
}

async function performSearch(query) {
    const animes = await searchAnime(query);
    displayResults(animes);
}

function displayResults(animes) {
    const oldResults = document.getElementById('search-results');
    if (oldResults) oldResults.remove();
    
    if (animes.length === 0) {
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

setActiveLink();
window.addEventListener('popstate', setActiveLink);
setupSearch();
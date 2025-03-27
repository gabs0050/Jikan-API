'use strict'
document.addEve// home.js (ou outro arquivo)
import { searchAnime } from './apiService.js';

document.addEventListener('DOMContentLoaded', function() {
    // Função para destacar link ativo (existente)
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

    // Configura a pesquisa
    function setupSearch() {
        const searchInput = document.getElementById('pesquisarAnime');
        const searchBox = document.querySelector('.box');
        
        // Debounce para evitar muitas requisições
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length > 2) { // Só pesquisa com pelo menos 3 caracteres
                    performSearch(query);
                }
            }, 500);
        });
        
        // Foco no input quando clicar na lupa
        searchBox.addEventListener('click', () => {
            searchInput.focus();
        });
    }
    
    // Executa a pesquisa e exibe resultados
    async function performSearch(query) {
        const animes = await searchAnime(query);
        displayResults(animes);
    }
    
    // Exibe os resultados na página
    function displayResults(animes) {
        // Remove resultados anteriores
        const oldResults = document.getElementById('search-results');
        if (oldResults) oldResults.remove();
        
        if (animes.length === 0) {
            // Pode mostrar uma mensagem de "Nenhum resultado encontrado"
            return;
        }
        
        // Cria container para resultados
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
        
        // Adiciona cada anime como um item
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
                // Aqui você pode redirecionar para uma página de detalhes ou mostrar mais informações
                window.location.href = `anime-details.html?id=${anime.mal_id}`;
            });
            
            resultsContainer.appendChild(animeElement);
        });
        
        // Adiciona os resultados abaixo da barra de pesquisa
        const searchBox = document.querySelector('.box');
        searchBox.appendChild(resultsContainer);
    }
    
    // Inicializa tudo
    setActiveLink();
    window.addEventListener('popstate', setActiveLink);
    setupSearch();
});
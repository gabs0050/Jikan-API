'use strict'
import { searchAnime } from './apiService.js';

document.addEventListener('DOMContentLoaded', function() {
    setActiveLink();
    window.addEventListener('popstate', setActiveLink);
    setupSearch();
    fetchAndDisplayRecommendations();
});

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
            window.location.href = `src/anime-details.html?id=${anime.mal_id}`;
        });
        
        resultsContainer.appendChild(animeElement);
    });
    
    const searchBox = document.querySelector('.box');
    searchBox.appendChild(resultsContainer);
}

async function fetchAndDisplayRecommendations() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/recommendations/anime');
        const data = await response.json();
        
        const uniqueAnimes = [];
        const addedAnimeIds = new Set();
        
        for (const recommendation of data.data) {
            for (const entry of recommendation.entry) {
                if (!addedAnimeIds.has(entry.mal_id) && uniqueAnimes.length < 10) {
                    uniqueAnimes.push({
                        id: entry.mal_id,
                        title: entry.title,
                        image: entry.images?.jpg?.large_image_url,
                        url: entry.url
                    });
                    addedAnimeIds.add(entry.mal_id);
                }
            }
        }
        
        displayRecommendations(uniqueAnimes);
        setupCarousel();
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

function displayRecommendations(animes) {
    const carouselTrack = document.getElementById('carousel-track');
    
    animes.forEach(anime => {
        const animeElement = document.createElement('div');
        animeElement.className = 'carousel-item';
        animeElement.innerHTML = `
            <a href="src/anime-details.html?id=${anime.id}" style="text-decoration: none; color: inherit;">
                <img src="${anime.image}" alt="${anime.title}">
                <div class="carousel-item-info">
                    <h3>${anime.title}</h3>
                    <p>Ver detalhes</p>
                </div>
            </a>
        `;
        carouselTrack.appendChild(animeElement);
    });
}

function setupCarousel() {
    const track = document.getElementById('carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 20;
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }
    
    nextBtn.addEventListener('click', () => {
        if (currentIndex < items.length - 4) {
            currentIndex++;
            updateCarousel();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
    
    setInterval(() => {
        if (currentIndex < items.length - 4) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }, 5000);
}
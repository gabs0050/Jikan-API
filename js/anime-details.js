// /js/anime-details.js
import { searchAnime } from './apiService.js'; // Importa a função searchAnime

// Função principal que é executada quando o DOM está completamente carregado
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    
    if (!animeId) {
        window.location.href = '/';
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
                <a href="/">Voltar</a>
            </div>
        `;
    }
});

// Função para destacar o link ativo no menu de navegação
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
    
    // Adiciona margem superior para mover os resultados para baixo
    resultsContainer.style.marginTop = '10px'; // Ajuste o valor conforme necessário

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
            // Redireciona para a página de detalhes do anime
            window.location.href = `anime-details.html?id=${anime.mal_id}`;
        });
        
        resultsContainer.appendChild(animeElement);
    });
    
    // Adiciona os resultados abaixo da barra de pesquisa
    const searchBox = document.querySelector('.box');
    searchBox.appendChild(resultsContainer);
}

// Exibe os detalhes do anime na página
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

// Inicializa tudo
setActiveLink();
window.addEventListener('popstate', setActiveLink);
setupSearch();
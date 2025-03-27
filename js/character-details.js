'use strict'
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    
    if (!characterId) {
        window.location.href = '/personagens.html';
        return;
    }

    try {
        const response = await fetch(`https://api.jikan.moe/v4/characters/${characterId}/full`);
        const data = await response.json();
        displayCharacterDetails(data.data);
    } catch (error) {
        console.error('Error fetching character details:', error);
        document.getElementById('character-details-container').innerHTML = `
            <div class="error">
                <h2>Erro ao carregar detalhes</h2>
                <p>${error.message}</p>
                <a href="/personagens.html">Voltar</a>
            </div>
        `;
    }
});

function displayCharacterDetails(character) {
    const container = document.getElementById('character-details-container');
    container.innerHTML = `
        <div class="character-detail">
            <img src="${character.images?.jpg?.image_url}" 
                 alt="${character.name}" 
                 class="character-image">
            <div class="character-info">
                <h1>${character.name}</h1>
                ${character.name_kanji ? `<p><strong>Nome em Kanji:</strong> ${character.name_kanji}</p>` : ''}
                ${character.nicknames?.length > 0 ? `<p><strong>Apelidos:</strong> ${character.nicknames.join(', ')}</p>` : ''}
                
                <div class="character-about">
                    <h3>Sobre</h3>
                    <p>${character.about || 'Informação não disponível.'}</p>
                </div>
                
                ${character.anime?.length > 0 ? `
                <div class="character-animes">
                    <h3>Animes</h3>
                    <div class="anime-grid">
                        ${character.anime.slice(0, 6).map(anime => `
                            <div class="anime-card">
                                <img src="${anime.anime.images?.jpg?.image_url}" alt="${anime.anime.title}">
                                <p>${anime.anime.title}</p>
                                <small>${anime.role}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Função para destacar link ativo (opcional, se quiser manter consistência)
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('ativo');
        let linkPage = link.getAttribute('href').split('/').pop().toLowerCase();
        
        if (linkPage === currentPage) {
            link.classList.add('ativo');
        }
    });
}

setActiveLink();
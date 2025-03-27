'use strict'
export async function searchAnime(query) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Erro ao buscar animes:', error);
        return [];
    }
}
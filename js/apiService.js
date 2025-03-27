// Função para pesquisar animes
export async function searchAnime(query, limit = 5) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) throw new Error('Erro na requisição');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Erro ao buscar animes:', error);
        return [];
    }
}

// Função para obter animes populares
export async function getTopAnimes(limit = 12) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/top/anime?limit=${limit}`);
        if (!response.ok) throw new Error('Erro na requisição');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Erro ao buscar animes populares:', error);
        return [];
    }
}
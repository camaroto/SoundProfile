package br.edu.ifms.soundprofile.spotify.dto;

public record SpotifyMusicaDTO(
        String spotifyId,
        String nome,
        String artista,
        String album,
        String imagem,
        Integer duracaoMs,
        String urlSpotify
) {
}
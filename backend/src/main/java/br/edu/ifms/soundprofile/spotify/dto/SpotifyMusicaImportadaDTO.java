package br.edu.ifms.soundprofile.spotify.dto;

/** Música já presente no catálogo do SoundProfile (criada agora ou já existente). */
public record SpotifyMusicaImportadaDTO(String slug, String titulo) {
}

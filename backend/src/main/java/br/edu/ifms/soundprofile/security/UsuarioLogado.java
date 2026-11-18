package br.edu.ifms.soundprofile.security;

/** Quem está autenticado na requisição atual (carregado a partir do token de sessão). */
public record UsuarioLogado(long idUsuario, String username, String role, String avatar) {

    public boolean admin() {
        return "admin".equals(role);
    }
}

package br.edu.ifms.soundprofile.comum;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Regras de validação de entrada (portadas do site para que o servidor nunca dependa do navegador). */
public final class Validacao {

    // Nomes que conflitam com rotas do site.
    private static final Set<String> RESERVADOS =
        Set.of("editar", "personalizar", "exemplo", "admin", "api", "login", "cadastro", "sair", "perfil");

    private static final Pattern USERNAME = Pattern.compile("^[a-zA-Z0-9_.]{3,20}$");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private Validacao() {
    }

    public static boolean usernameReservado(String username) {
        return RESERVADOS.contains(username.toLowerCase(Locale.ROOT));
    }

    public static boolean usernameValido(String username) {
        return USERNAME.matcher(username).matches();
    }

    /** Devolve um mapa campo -> mensagem. Vazio significa que está tudo certo. */
    public static Map<String, String> validarCadastro(String username, String email, String senha) {
        Map<String, String> erros = new LinkedHashMap<>();

        if (!USERNAME.matcher(username).matches()) {
            erros.put("username", "Use de 3 a 20 caracteres: letras, números, _ ou ponto.");
        } else if (usernameReservado(username)) {
            erros.put("username", "Este nome de usuário não está disponível.");
        }

        if (email.length() > 254 || !EMAIL.matcher(email).matches()) {
            erros.put("email", "Digite um e-mail válido.");
        }

        if (senha.length() < 8) {
            erros.put("password", "A senha deve ter pelo menos 8 caracteres.");
        } else if (senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            // Limite do BCrypt.
            erros.put("password", "A senha pode ter no máximo 72 caracteres.");
        }
        return erros;
    }

    public static Map<String, String> validarPerfil(String nomeExibicao, String localizacao, String biografia) {
        Map<String, String> erros = new LinkedHashMap<>();
        if (nomeExibicao.length() > 40) erros.put("nomeExibicao", "O nome pode ter no máximo 40 caracteres.");
        if (localizacao.length() > 60) erros.put("localizacao", "A localização pode ter no máximo 60 caracteres.");
        if (biografia.length() > 300) erros.put("biografia", "A biografia pode ter no máximo 300 caracteres.");
        return erros;
    }

    /** Padrão para ILIKE: evita que \, % e _ digitados virem curingas. */
    public static String padraoBusca(String q) {
        String escapado = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escapado + "%";
    }

    public static String texto(String valor) {
        return valor == null ? "" : valor.replace("\r\n", "\n").trim();
    }
}

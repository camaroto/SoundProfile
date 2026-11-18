package br.edu.ifms.soundprofile.comum;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class ValidacaoTest {

    @Test
    void cadastroValidoNaoTemErros() {
        assertThat(Validacao.validarCadastro("gustavo.s", "gustavo@email.com", "senhaSegura1")).isEmpty();
    }

    @Test
    void rejeitaUsernameInvalidoOuReservado() {
        assertThat(Validacao.validarCadastro("ab", "a@b.co", "12345678")).containsKey("username");
        assertThat(Validacao.validarCadastro("com espaço", "a@b.co", "12345678")).containsKey("username");
        assertThat(Validacao.validarCadastro("admin", "a@b.co", "12345678")).containsKey("username");
        assertThat(Validacao.validarCadastro("Personalizar", "a@b.co", "12345678")).containsKey("username");
    }

    @Test
    void rejeitaEmailInvalido() {
        assertThat(Validacao.validarCadastro("usuario", "semarroba", "12345678")).containsKey("email");
        assertThat(Validacao.validarCadastro("usuario", "a@b", "12345678")).containsKey("email");
    }

    @Test
    void validaTamanhoDaSenhaEmBytes() {
        assertThat(Validacao.validarCadastro("usuario", "a@b.co", "1234567")).containsKey("password");
        assertThat(Validacao.validarCadastro("usuario", "a@b.co", "a".repeat(73))).containsKey("password");
        // 40 emojis = 160 bytes em UTF-8: passa de 72 bytes mesmo com poucos caracteres.
        assertThat(Validacao.validarCadastro("usuario", "a@b.co", "😀".repeat(40))).containsKey("password");
        assertThat(Validacao.validarCadastro("usuario", "a@b.co", "a".repeat(72))).isEmpty();
    }

    @Test
    void validaLimitesDoPerfil() {
        assertThat(Validacao.validarPerfil("a".repeat(40), "b".repeat(60), "c".repeat(300))).isEmpty();
        Map<String, String> erros = Validacao.validarPerfil("a".repeat(41), "b".repeat(61), "c".repeat(301));
        assertThat(erros).containsKeys("nomeExibicao", "localizacao", "biografia");
    }

    @Test
    void padraoDeBuscaEscapaCuringas() {
        assertThat(Validacao.padraoBusca("rock")).isEqualTo("%rock%");
        assertThat(Validacao.padraoBusca("100%_\\")).isEqualTo("%100\\%\\_\\\\%");
    }

    @Test
    void textoApara() {
        assertThat(Validacao.texto("  oi\r\nmundo ")).isEqualTo("oi\nmundo");
        assertThat(Validacao.texto(null)).isEmpty();
    }
}

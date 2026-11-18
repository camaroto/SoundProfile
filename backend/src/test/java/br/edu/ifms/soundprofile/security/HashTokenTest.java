package br.edu.ifms.soundprofile.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class HashTokenTest {

    @Test
    void geraSha256EmHexadecimal() {
        // Vetor de teste padrão do SHA-256.
        assertThat(HashToken.sha256("abc"))
            .isEqualTo("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    }

    @Test
    void tokensDiferentesGeramHashesDiferentes() {
        assertThat(HashToken.sha256("a")).isNotEqualTo(HashToken.sha256("b"));
        assertThat(HashToken.sha256("a")).hasSize(64);
    }
}

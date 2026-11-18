package br.edu.ifms.soundprofile.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EmailServiceTest {

    @Test
    void escapaTextoParaJson() {
        assertThat(EmailService.json("oi")).isEqualTo("\"oi\"");
        assertThat(EmailService.json("a\"b\\c\nd")).isEqualTo("\"a\\\"b\\\\c\\nd\"");
        assertThat(EmailService.json("\u0001")).isEqualTo("\"\\u0001\"");
    }
}

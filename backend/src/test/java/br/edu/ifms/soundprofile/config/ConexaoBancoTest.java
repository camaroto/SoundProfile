package br.edu.ifms.soundprofile.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class ConexaoBancoTest {

    @Test
    void converteUrlDoNeonParaJdbc() {
        ConexaoBanco c = ConexaoBanco.deUrl(
            "postgresql://usuario:senha123@ep-exemplo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

        assertThat(c.usuario()).isEqualTo("usuario");
        assertThat(c.senha()).isEqualTo("senha123");
        assertThat(c.jdbcUrl())
            .startsWith("jdbc:postgresql://ep-exemplo-pooler.sa-east-1.aws.neon.tech:5432/neondb?")
            .contains("sslmode=require")
            .contains("channelBinding=require")        // o driver JDBC usa este nome
            .doesNotContain("channel_binding")
            .contains("prepareThreshold=0");           // compatível com o pooler do Neon
    }

    @Test
    void decodificaCaracteresEspeciaisDaSenha() {
        ConexaoBanco c = ConexaoBanco.deUrl("postgresql://postgres:p%40ss%3Aw%2Frd@localhost:5433/soundprofile");

        assertThat(c.senha()).isEqualTo("p@ss:w/rd");
        assertThat(c.jdbcUrl()).startsWith("jdbc:postgresql://localhost:5433/soundprofile");
    }

    @Test
    void aceitaEsquemaPostgres() {
        assertThat(ConexaoBanco.deUrl("postgres://u:s@host/db").jdbcUrl()).startsWith("jdbc:postgresql://host:5432/db");
    }

    @Test
    void naoDuplicaPrepareThreshold() {
        ConexaoBanco c = ConexaoBanco.deUrl("postgresql://u:s@host/db?prepareThreshold=3");
        assertThat(c.jdbcUrl()).contains("prepareThreshold=3").doesNotContain("prepareThreshold=0");
    }

    @Test
    void rejeitaUrlInvalida() {
        assertThatThrownBy(() -> ConexaoBanco.deUrl("mysql://u:s@host/db")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ConexaoBanco.deUrl("postgresql:///semservidor")).isInstanceOf(IllegalArgumentException.class);
    }
}

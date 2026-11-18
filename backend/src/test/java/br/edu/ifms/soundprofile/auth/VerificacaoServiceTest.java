package br.edu.ifms.soundprofile.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VerificacaoServiceTest {

    @Test
    void codigoSempreTemSeisDigitos() {
        assertThat(VerificacaoService.formatarCodigo(0)).isEqualTo("000000");
        assertThat(VerificacaoService.formatarCodigo(42)).isEqualTo("000042");
        assertThat(VerificacaoService.formatarCodigo(999_999)).isEqualTo("999999");
    }

    @Test
    void limitesDeSegurancaSaoOsCombinados() {
        assertThat(VerificacaoService.VALIDADE_MINUTOS).isEqualTo(10);
        assertThat(VerificacaoService.MAX_TENTATIVAS).isEqualTo(5);
        assertThat(VerificacaoService.INTERVALO_REENVIO_S).isEqualTo(60);
        assertThat(VerificacaoService.MAX_ENVIOS_POR_HORA).isEqualTo(5);
    }
}

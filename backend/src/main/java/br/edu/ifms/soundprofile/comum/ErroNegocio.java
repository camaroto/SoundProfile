package br.edu.ifms.soundprofile.comum;

import java.util.Map;
import org.springframework.http.HttpStatus;

/** Erro previsto pelas regras de negócio: vira uma resposta HTTP com mensagem para o usuário. */
public class ErroNegocio extends RuntimeException {

    private final HttpStatus status;
    private final String codigo;
    private final transient Map<String, String> campos;

    public ErroNegocio(HttpStatus status, String mensagem) {
        this(status, null, mensagem, Map.of());
    }

    public ErroNegocio(HttpStatus status, String mensagem, Map<String, String> campos) {
        this(status, null, mensagem, campos);
    }

    public ErroNegocio(HttpStatus status, String codigo, String mensagem, Map<String, String> campos) {
        super(mensagem);
        this.status = status;
        this.codigo = codigo;
        this.campos = campos == null ? Map.of() : campos;
    }

    public HttpStatus getStatus() { return status; }
    public String getCodigo() { return codigo; }
    public Map<String, String> getCampos() { return campos; }
}

package br.edu.ifms.soundprofile.comum;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Converte exceções em respostas JSON no mesmo formato, sem vazar detalhes internos. */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ErroNegocio.class)
    public ResponseEntity<RespostaErro> negocio(ErroNegocio e) {
        return ResponseEntity.status(e.getStatus()).body(new RespostaErro(e.getCodigo(), e.getMessage(), e.getCampos()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RespostaErro> corpoInvalido(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(new RespostaErro(null, "Corpo da requisição inválido.", Map.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespostaErro> inesperado(Exception e) {
        // Erros do próprio Spring MVC (404, 405, 415...) já trazem o status certo.
        if (e instanceof ErrorResponse er) {
            HttpStatus status = HttpStatus.resolve(er.getStatusCode().value());
            String mensagem = status != null ? status.getReasonPhrase() : "Erro na requisição.";
            return ResponseEntity.status(er.getStatusCode()).body(new RespostaErro(null, mensagem, Map.of()));
        }
        log.error("Erro inesperado", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new RespostaErro(null, "Erro interno. Tente novamente em instantes.", Map.of()));
    }
}

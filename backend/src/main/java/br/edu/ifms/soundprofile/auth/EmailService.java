package br.edu.ifms.soundprofile.auth;

import br.edu.ifms.soundprofile.config.PropriedadesApp;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Envia e-mail por API HTTP (sem biblioteca extra). Usa o Brevo ou o Resend, conforme as variáveis de ambiente.
 * Sem nenhum dos dois: em modo de desenvolvimento o e-mail vai para o log; em produção, falha.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final PropriedadesApp.Email config;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public EmailService(PropriedadesApp props) {
        this.config = props.email();
    }

    public record Mensagem(String para, String assunto, String texto, String html) {
    }

    public void enviar(Mensagem m) throws IOException {
        if (config.temBrevo()) {
            String corpo = "{\"sender\":{\"name\":" + json(config.deNome()) + ",\"email\":" + json(config.de()) + "},"
                + "\"to\":[{\"email\":" + json(m.para()) + "}],\"subject\":" + json(m.assunto()) + ","
                + "\"htmlContent\":" + json(m.html()) + ",\"textContent\":" + json(m.texto()) + "}";
            postar("https://api.brevo.com/v3/smtp/email", "api-key", config.brevoApiKey(), corpo, "Brevo");
        } else if (config.temResend()) {
            String corpo = "{\"from\":" + json(config.deNome() + " <" + config.de() + ">") + ",\"to\":[" + json(m.para()) + "],"
                + "\"subject\":" + json(m.assunto()) + ",\"html\":" + json(m.html()) + ",\"text\":" + json(m.texto()) + "}";
            postar("https://api.resend.com/emails", "Authorization", "Bearer " + config.resendApiKey(), corpo, "Resend");
        } else if (config.modoDesenvolvimento()) {
            log.info("\n[e-mail de desenvolvimento] Para: {}\nAssunto: {}\n{}\n", m.para(), m.assunto(), m.texto());
        } else {
            throw new IOException("Serviço de e-mail não configurado.");
        }
    }

    private void postar(String url, String cabecalho, String valor, String corpo, String servico) throws IOException {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(10))
            .header("content-type", "application/json")
            .header("accept", "application/json")
            .header(cabecalho, valor)
            .POST(HttpRequest.BodyPublishers.ofString(corpo))
            .build();
        try {
            HttpResponse<Void> res = http.send(req, HttpResponse.BodyHandlers.discarding());
            // Só o status é registrado: o corpo da resposta pode conter dados da conta.
            if (res.statusCode() >= 300) throw new IOException(servico + " recusou o envio (HTTP " + res.statusCode() + ").");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Envio interrompido.", e);
        }
    }

    /** Texto como literal JSON (aspas, barras, quebras de linha e caracteres de controle escapados). */
    static String json(String valor) {
        StringBuilder sb = new StringBuilder("\"");
        for (char c : valor.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.append('"').toString();
    }
}

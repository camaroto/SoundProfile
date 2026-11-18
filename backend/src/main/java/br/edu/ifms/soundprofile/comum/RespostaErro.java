package br.edu.ifms.soundprofile.comum;

import java.util.Map;

/** Corpo padrão de todos os erros da API. "campos" traz a mensagem de cada campo inválido. */
public record RespostaErro(String codigo, String mensagem, Map<String, String> campos) {
}

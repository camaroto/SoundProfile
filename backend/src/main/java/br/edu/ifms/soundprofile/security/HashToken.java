package br.edu.ifms.soundprofile.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * O token de sessão nunca é guardado no banco: só o SHA-256 dele (em hexadecimal).
 * É o mesmo formato que o site já usa, então as sessões existentes continuam valendo.
 */
public final class HashToken {

    private HashToken() {
    }

    public static String sha256(String token) {
        try {
            byte[] resumo = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resumo);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}

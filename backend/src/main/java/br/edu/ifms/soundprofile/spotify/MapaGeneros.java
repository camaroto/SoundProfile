package br.edu.ifms.soundprofile.spotify;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Traduz os gêneros que o Spotify e o Deezer informam (em inglês e bem específicos, como
 * "brazilian rock" ou "Rap/Hip Hop") para os 18 gêneros do SoundProfile.
 */
final class MapaGeneros {

    // A ordem importa só para a leitura; um gênero de origem pode cair em mais de um gênero do site.
    private static final List<Map.Entry<String, Pattern>> REGRAS = List.of(
        regra("metal", "metal"),
        regra("punk", "punk"),
        regra("rock", "rock|grunge"),
        regra("indie", "indie|alternative|shoegaze|dream pop"),
        regra("rap", "\\brap\\b|hip hop|hip-hop|trap"),
        regra("rb-soul", "r&b|\\bsoul\\b|neo soul|r and b"),
        regra("jazz", "jazz"),
        regra("mpb", "\\bmpb\\b|bossa nova|tropic[aá]lia|brazilian|brasil"),
        regra("samba-pagode", "samba|pagode"),
        regra("sertanejo", "sertanejo"),
        regra("funk", "funk"),
        regra("eletronica", "electro|edm|house|techno|trance|dubstep|drum and bass|synth|dance"),
        regra("blues", "blues"),
        regra("reggae", "reggae|\\bska\\b"),
        regra("country", "country"),
        regra("classica", "classical|orchestra|baroque|opera"),
        regra("folk", "folk|singer-songwriter"),
        regra("pop", "\\bpop\\b"));

    private MapaGeneros() {
    }

    private static Map.Entry<String, Pattern> regra(String slug, String expressao) {
        return Map.entry(slug, Pattern.compile(expressao, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE));
    }

    static Set<String> slugs(Collection<String> generosDeOrigem) {
        Set<String> achados = new LinkedHashSet<>();
        for (String origem : generosDeOrigem) {
            if (origem == null || origem.isBlank()) continue;
            String texto = origem.toLowerCase(Locale.ROOT);
            for (Map.Entry<String, Pattern> regra : REGRAS) {
                if (regra.getValue().matcher(texto).find()) achados.add(regra.getKey());
            }
        }
        return achados;
    }
}

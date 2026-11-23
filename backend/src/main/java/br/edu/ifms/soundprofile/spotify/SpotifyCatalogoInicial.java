package br.edu.ifms.soundprofile.spotify;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

/**
 * Catálogo inicial com músicas famosas, para o site já ter conteúdo antes de alguém pesquisar ou entrar.
 * Roda sozinho (em segundo plano) quando há poucas músicas em destaque e o Spotify está configurado;
 * o administrador também pode pedir de novo. É idempotente: repetir não duplica nada.
 */
@Service
public class SpotifyCatalogoInicial {

    private static final Logger log = LoggerFactory.getLogger(SpotifyCatalogoInicial.class);
    private static final int MINIMO_DE_DESTAQUES = 12;

    private record Faixa(String titulo, String artista) {
    }

    // Mistura de gêneros e de épocas, com bastante música brasileira.
    private static final List<Faixa> FAMOSAS = List.of(
        new Faixa("Bohemian Rhapsody", "Queen"),
        new Faixa("Billie Jean", "Michael Jackson"),
        new Faixa("Smells Like Teen Spirit", "Nirvana"),
        new Faixa("Hotel California", "Eagles"),
        new Faixa("Hey Jude", "The Beatles"),
        new Faixa("Comfortably Numb", "Pink Floyd"),
        new Faixa("Sweet Child O' Mine", "Guns N' Roses"),
        new Faixa("Numb", "Linkin Park"),
        new Faixa("Enter Sandman", "Metallica"),
        new Faixa("Back In Black", "AC/DC"),
        new Faixa("Viva La Vida", "Coldplay"),
        new Faixa("Creep", "Radiohead"),
        new Faixa("Get Lucky", "Daft Punk"),
        new Faixa("Rolling in the Deep", "Adele"),
        new Faixa("bad guy", "Billie Eilish"),
        new Faixa("Blinding Lights", "The Weeknd"),
        new Faixa("Levitating", "Dua Lipa"),
        new Faixa("Shape of You", "Ed Sheeran"),
        new Faixa("Uptown Funk", "Mark Ronson"),
        new Faixa("Lose Yourself", "Eminem"),
        new Faixa("HUMBLE.", "Kendrick Lamar"),
        new Faixa("Halo", "Beyoncé"),
        new Faixa("Back to Black", "Amy Winehouse"),
        new Faixa("Three Little Birds", "Bob Marley & The Wailers"),
        new Faixa("Tempo Perdido", "Legião Urbana"),
        new Faixa("Exagerado", "Cazuza"),
        new Faixa("Oceano", "Djavan"),
        new Faixa("Do Leme ao Pontal", "Tim Maia"),
        new Faixa("Mas Que Nada", "Jorge Ben Jor"),
        new Faixa("Aquele Abraço", "Gilberto Gil"),
        new Faixa("Sozinho", "Caetano Veloso"),
        new Faixa("Ainda Lembro", "Marisa Monte"),
        new Faixa("Envolver", "Anitta"),
        new Faixa("Anna Júlia", "Los Hermanos"),
        new Faixa("Zóio de Lula", "Charlie Brown Jr."),
        new Faixa("Diário de um Detento", "Racionais MC's"),
        new Faixa("Tanto", "Skank"),
        new Faixa("Epitáfio", "Titãs"));

    private final SpotifyService spotify;
    private final SpotifyRepository repository;
    private final SpotifyPropriedades propriedades;

    public SpotifyCatalogoInicial(SpotifyService spotify, SpotifyRepository repository, SpotifyPropriedades propriedades) {
        this.spotify = spotify;
        this.repository = repository;
        this.propriedades = propriedades;
    }

    /** Ao iniciar a API: em segundo plano, para não atrasar a subida. */
    @EventListener(ApplicationReadyEvent.class)
    public void aoIniciar() {
        if (propriedades.clientId() == null || propriedades.clientId().isBlank()) {
            return;
        }
        Thread.startVirtualThread(() -> {
            try {
                if (repository.contarDestaques() < MINIMO_DE_DESTAQUES) {
                    log.info("Montando o catálogo inicial com músicas famosas...");
                    log.info("Catálogo inicial: {} músicas em destaque.", executar());
                }
                int artistas = spotify.enriquecerArtistasPendentes(40);
                if (artistas > 0) {
                    log.info("Fotos e gêneros completados para {} artistas.", artistas);
                }
            } catch (RuntimeException e) {
                log.warn("Não foi possível montar o catálogo inicial agora: {}", e.getClass().getSimpleName());
            }
        });
    }

    /** Importa as músicas famosas e as marca como destaque. Devolve quantas ficaram em destaque. */
    public int executar() {
        int ordem = 0;
        int destacadas = 0;
        for (Faixa f : FAMOSAS) {
            ordem++;
            try {
                Optional<JsonNode> faixa = spotify.buscarPrimeiraFaixa(
                    "track:\"" + f.titulo() + "\" artist:\"" + f.artista() + "\"");
                if (faixa.isEmpty()) {
                    continue;
                }
                spotify.salvarFaixaCompleta(faixa.get());
                repository.marcarDestaque(faixa.get().path("id").asText(), ordem);
                destacadas++;
                Thread.sleep(250); // educado com o limite de requisições do Spotify
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (RuntimeException e) {
                log.warn("Catálogo inicial: pulando \"{}\" ({})", f.titulo(), e.getClass().getSimpleName());
            }
        }
        return destacadas;
    }
}

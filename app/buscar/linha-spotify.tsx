import BotaoPreview from "@/app/components/preview/botao-preview";
import BotaoSubmit from "@/app/components/social/botao-submit";
import { Capa, botaoPequeno } from "@/app/components/ui";
import { avaliarMusicaSpotify } from "./actions";

export type SpotifyMusica = {
  spotifyId: string;
  nome: string;
  artista: string;
  album: string;
  imagem: string;
  duracaoMs: number | null;
  urlSpotify: string;
};

function formatarDuracao(ms: number | null) {
  if (!ms) return "";
  const segundos = Math.floor(ms / 1000);
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

// Música que veio do Spotify e ainda pode não estar no catálogo. "Avaliar" traz a música para o
// SoundProfile e abre a página dela. Os botões ficam ao lado (e não dentro) do bloco clicável.
export default function LinhaSpotify({ musica, q }: { musica: SpotifyMusica; q: string }) {
  return (
    <li className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 transition last:border-0 hover:bg-violet-500/[0.05]">
      <Capa src={musica.imagem} nome={musica.album} alt="" className="h-12 w-12 shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{musica.nome}</p>
        <p className="truncate text-xs text-white/45">
          {musica.artista} · {musica.album}
        </p>
      </div>

      <span className="hidden shrink-0 text-xs tabular-nums text-white/35 sm:block">{formatarDuracao(musica.duracaoMs)}</span>

      <BotaoPreview titulo={musica.nome} artista={musica.artista} />

      <a
        href={musica.urlSpotify}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir ${musica.nome} no Spotify`}
        title="Abrir no Spotify"
        className="hidden h-9 shrink-0 items-center rounded-full border border-white/15 px-3 text-xs font-medium text-white/70 transition hover:border-violet-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:inline-flex"
      >
        Spotify ↗
      </a>

      <form action={avaliarMusicaSpotify}>
        <input type="hidden" name="spotifyId" value={musica.spotifyId} />
        <input type="hidden" name="q" value={q} />
        <BotaoSubmit pendente="Abrindo…" className={botaoPequeno}>
          Avaliar
        </BotaoSubmit>
      </form>
    </li>
  );
}

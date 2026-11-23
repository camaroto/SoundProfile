import AbasMusica, { type AbaMusica } from "@/app/components/abas-musica";
import FormBusca from "@/app/components/form-busca";

// Título, busca e abas da área de músicas (mesmo topo em Músicas, Álbuns e Artistas).
export default function CabecalhoMusicas({ ativa }: { ativa: AbaMusica }) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Músicas</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Explore álbuns, artistas e músicas e veja o que a comunidade acha.</p>
      <div className="mt-6">
        <FormBusca placeholder="Buscar artistas, álbuns, músicas..." />
      </div>
      <div className="mt-6">
        <AbasMusica ativa={ativa} />
      </div>
    </>
  );
}

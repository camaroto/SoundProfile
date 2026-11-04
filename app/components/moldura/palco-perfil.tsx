import type { IdBalao, IdMoldura } from "@/lib/molduras";
import BalaoPerfil from "./balao";
import MolduraCanvas from "./moldura-canvas";

// As molduras foram desenhadas numa área de 2167 x 726 com a janela do banner em
// (140,90)-(2026,410) e a foto em círculo centrado em (207,540), raio 75.
// Aqui essas medidas viram porcentagens, então o conjunto escala junto com a largura.
const W = 2167;
const H = 726;
const pctX = (v: number) => `${((v / W) * 100).toFixed(3)}%`;
const pctY = (v: number) => `${((v / H) * 100).toFixed(3)}%`;

// Banner + foto + moldura de um perfil. Usado na página do perfil e na prévia do editor.
export default function PalcoPerfil({
  nome, banner, avatar, moldura, balao,
}: {
  nome: string;
  banner: string | null;
  avatar: string | null;
  moldura: IdMoldura;
  balao: IdBalao | null;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}>
      {/* Banner dentro da janela da moldura */}
      <div
        className="absolute overflow-hidden rounded-[0.6cqw] bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950"
        style={{ left: pctX(140), top: pctY(90), width: pctX(1886), height: pctY(320) }}
      >
        {banner && <img src={banner} alt={`Banner de ${nome}`} className="absolute inset-0 h-full w-full object-cover object-center" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070d]/60 via-transparent to-transparent" />
      </div>

      {/* Foto de perfil no encaixe circular */}
      <div
        className="absolute overflow-hidden rounded-full bg-[#171020]"
        style={{ left: pctX(207 - 75), top: pctY(540 - 75), width: pctX(150), height: pctY(150) }}
      >
        {avatar ? (
          <img src={avatar} alt={`Foto de ${nome}`} className="h-full w-full object-cover" />
        ) : (
          <div
            role="img"
            aria-label={`Foto de ${nome}`}
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 font-semibold text-violet-300"
            style={{ fontSize: "3.2cqw" }}
          >
            {nome[0]?.toUpperCase() ?? "♫"}
          </div>
        )}
      </div>

      {balao && (
        <div className="absolute z-30" style={{ left: pctX(250), top: pctY(470), transform: "translateY(-100%)" }}>
          <BalaoPerfil tipo={balao} />
        </div>
      )}

      <MolduraCanvas moldura={moldura} />
    </div>
  );
}

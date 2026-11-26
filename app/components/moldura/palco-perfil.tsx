
import type { IdBalao, IdMoldura } from "@/lib/molduras";
import BalaoPerfil from "./balao";
import MolduraCanvas from "./moldura-canvas";

const W = 2167;
const H = 726;

const pctX = (v: number) => `${((v / W) * 100).toFixed(3)}%`;
const pctY = (v: number) => `${((v / H) * 100).toFixed(3)}%`;

export default function PalcoPerfil({
  nome,
  banner,
  avatar,
  moldura,
  balao,
}: {
  nome: string;
  banner: string | null;
  avatar: string | null;
  moldura: IdMoldura;
  balao: IdBalao | null;
}) {
  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: `${W} / ${H}`,
        containerType: "inline-size",
      }}
    >
      {/* Banner ocupando todo o palco */}
      <div
        className="absolute left-0 top-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950"
        style={{ height: pctY(620) }}
      >
        {banner && (
          <img
            src={banner}
            alt={`Banner de ${nome}`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#08070d]/65 via-transparent to-transparent" />
      </div>

      {/* Foto de perfil sobreposta ao banner */}
      <div
        className="absolute z-10 overflow-hidden rounded-full bg-[#171020]"
        style={{
          left: pctX(207 - 75),
          top: pctY(550),
          width: pctX(150),
          height: pctY(150),
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={`Foto de ${nome}`}
            className="h-full w-full object-cover"
          />
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

      {/* Balão de fala */}
      {balao && (
        <div
          className="absolute z-30"
          style={{
            left: pctX(250),
            top: pctY(580),
            transform: "translateY(-100%)",
          }}
        >
          <BalaoPerfil tipo={balao} />
        </div>
      )}

      {/* Camada transparente da moldura */}
      <MolduraCanvas moldura={moldura} />
    </div>
  );
}

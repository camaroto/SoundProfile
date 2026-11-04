import { BALOES, type IdBalao } from "@/lib/molduras";

// Balão de fala em pixel art que fica no canto da foto de perfil. Os tamanhos são
// múltiplos de 46 px para os pixels ficarem nítidos (92 px = 2x).
export default function BalaoPerfil({ tipo, className = "" }: { tipo: IdBalao | null; className?: string }) {
  const balao = BALOES.find((b) => b.id === tipo);
  if (!balao) return null;

  if (balao.animado) {
    return <div role="img" aria-label="Balão de fala animado" className={`balao-sticker ${className}`} />;
  }
  return (
    <img
      src={`/molduras/balao/${balao.arquivo}`}
      width={92}
      height={68}
      alt={`Balão de fala: ${balao.nome}`}
      className={`block h-[68px] w-[92px] max-w-none ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

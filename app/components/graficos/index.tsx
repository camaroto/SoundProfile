// Gráficos em SVG puro (sem biblioteca). Cada um tem uma tabela escondida para
// leitores de tela, com os mesmos números.

type Ponto = { rotulo: string; valor: number };

export function GraficoBarras({ titulo, dados, cor = "#8b5cf6", passoRotulo = 1 }: { titulo: string; dados: Ponto[]; cor?: string; passoRotulo?: number }) {
  // A largura do desenho acompanha a quantidade de barras: poucas barras ficam
  // maiores (e legíveis no celular), muitas barras ganham mais espaço.
  const largura = Math.min(560, Math.max(320, dados.length * 40));
  const altura = 210;
  const base = 32;
  const topo = 20;
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const slot = largura / dados.length;
  const barra = Math.min(36, slot * 0.7);
  const mostrarValor = slot >= 24;

  return (
    <figure>
      <svg viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label={titulo} className="h-auto w-full">
        <line x1="0" x2={largura} y1={altura - base} y2={altura - base} stroke="rgba(255,255,255,0.12)" />
        {dados.map((d, i) => {
          const h = (d.valor / maximo) * (altura - base - topo);
          const x = i * slot + (slot - barra) / 2;
          return (
            <g key={`${d.rotulo}-${i}`}>
              <rect x={x} y={altura - base - h} width={barra} height={h} rx="4" fill={cor} opacity={d.valor ? 0.9 : 0.15} />
              {d.valor > 0 && mostrarValor && (
                <text x={x + barra / 2} y={altura - base - h - 5} textAnchor="middle" fontSize="15" fill="rgba(255,255,255,0.7)">
                  {d.valor}
                </text>
              )}
              {i % passoRotulo === 0 && (
                <text x={x + barra / 2} y={altura - 9} textAnchor="middle" fontSize="15" fill="rgba(255,255,255,0.45)">
                  {d.rotulo}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        {titulo}: {dados.map((d) => `${d.rotulo}: ${d.valor}`).join("; ")}
      </figcaption>
    </figure>
  );
}

export function BarrasHorizontais({ titulo, dados }: { titulo: string; dados: { rotulo: string; valor: number; href?: string }[] }) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  return (
    <ul aria-label={titulo} className="space-y-3">
      {dados.map((d) => (
        <li key={d.rotulo} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-white/70 sm:w-36">{d.rotulo}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400" style={{ width: `${(d.valor / maximo) * 100}%` }} />
          </div>
          <span className="w-8 text-right tabular-nums text-white/40">{d.valor}</span>
        </li>
      ))}
    </ul>
  );
}

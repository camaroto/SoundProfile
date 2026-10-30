// Foto redonda do usuário; sem foto, mostra a inicial. Sem dependências de servidor,
// então serve tanto para componentes de servidor quanto de cliente.
export default function Avatar({ src, nome, className = "h-10 w-10" }: { src: string | null; nome: string; className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 ${className}`}>
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-sm font-semibold text-violet-300">
          {nome.trim()[0]?.toUpperCase() ?? "♫"}
        </span>
      )}
    </span>
  );
}

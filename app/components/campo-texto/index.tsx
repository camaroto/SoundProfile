type CampoTextoProps = {
  id: string;
  rotulo: string;
  icone: string;
  erro?: string;
  ajuda?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & { name?: string };

// Campo de formulário com ícone, rótulo e mensagem de erro acessível.
export default function CampoTexto({
  id,
  name = id,
  rotulo,
  icone,
  erro,
  ajuda,
  ...input
}: CampoTextoProps) {
  const idMensagem = `${id}-mensagem`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white">
        {rotulo}
      </label>

      <div className="relative">
        <img
          src={icone}
          alt=""
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 brightness-0 invert"
        />
        <input
          id={id}
          name={name}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || ajuda ? idMensagem : undefined}
          className={`w-full rounded-lg border bg-neutral-800 p-3 pl-11 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2 ${
            erro
              ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
              : "border-white/10 focus:border-purple-500 focus:ring-purple-500/30"
          }`}
          {...input}
        />
      </div>

      {erro ? (
        <p id={idMensagem} role="alert" className="mt-2 text-xs text-red-400">
          {erro}
        </p>
      ) : (
        ajuda && (
          <p id={idMensagem} className="mt-2 text-xs text-neutral-500">
            {ajuda}
          </p>
        )
      )}
    </div>
  );
}

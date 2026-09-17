export default function Footer() {
  return (
    <footer className="bg-[#0b0c0f] text-white border-t border-violet-950">

      <div className="max-w-6xl mx-auto px-10 py-10">

        <div className="grid grid-cols-4 gap-20">

          {/* Seu perfil */}
          <div>
            <h2 className="text-base font-bold border-l-2 border-violet-500 pl-2">
              SEU PERFIL MUSICAL
            </h2>

            <p className="text-sm text-neutral-500 mt-4">
              Toda sua jornada musical em um só lugar.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-bold">
              EXPLORAR
            </h3>

            <div className="flex flex-col mt-3 gap-2 text-sm text-neutral-500">
              <a href="#" className="hover:text-white transition">
                Buscar
              </a>

              <a href="#" className="hover:text-white transition">
                Artistas
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold">
              LEGAL
            </h3>

            <div className="flex flex-col mt-3 gap-2 text-sm text-neutral-500">
              <a href="#" className="hover:text-white transition">
                Política de privacidade
              </a>

              <a href="#" className="hover:text-white transition">
                Termos de serviço
              </a>

              <a href="#" className="hover:text-white transition">
                Contato
              </a>
            </div>
          </div>

          {/* Comunidade */}
          <div>
            <h3 className="text-sm font-bold">
              COMUNIDADE
            </h3>

            <div className="flex flex-col mt-3 gap-2 text-sm text-neutral-500">
              <a href="#" className="hover:text-white transition">
                Discord
              </a>

              <a href="#" className="hover:text-white transition">
                X (Twitter)
              </a>

              <a href="#" className="hover:text-white transition">
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="border-b border-neutral-900 mt-10"></div>

        <p className="text-xs text-neutral-600 mt-5">
          © 2026 SoundProfile. Todos os direitos reservados.
        </p>

      </div>

    </footer>
  );
}
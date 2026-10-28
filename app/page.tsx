import Link from "next/link";
const usuarios = [
  { nome: "Kuramoto", usuario: "@kuramoto", genero: "Metal alternativo", avatar: "/gato.jpg" },
  { nome: "Alex", usuario: "@alex.wav", genero: "Rock alternativo", avatar: "/gato.jpg" },
  { nome: "Mika", usuario: "@mika", genero: "Shoegaze", avatar: "/gato.jpg" },
  { nome: "Renan", usuario: "@renan.mp3", genero: "Nu metal", avatar: "/gato.jpg" },
  { nome: "Luna", usuario: "@luna", genero: "Indie rock", avatar: "/gato.jpg" },
  { nome: "Kaio", usuario: "@kaio", genero: "Metal", avatar: "/gato.jpg" },
  { nome: "Nina", usuario: "@nina.wav", genero: "Dream pop", avatar: "/gato.jpg" },
  { nome: "Victor", usuario: "@victor", genero: "Grunge", avatar: "/gato.jpg" },
];

const navegacao = [
  { nome: "Social", href: "#comunidade" },
  { nome: "Músicas", href: "#albuns" },
  { nome: "Reviews", href: "#reviews" },
  { nome: "Listas", href: "#descobertas" },
  { nome: "Rankings", href: "#artistas" },
];

const albuns = [
  { nome: "Significant Other", artista: "Limp Bizkit", imagem: "/albums/album1.jpg" },
  { nome: "Clint Eastwood", artista: "Gorillaz", imagem: "/albums/clint.jfif" },
  { nome: "Diamond Eyes", artista: "Deftones", imagem: "/albums/diamond-eyes.avif" },
  { nome: "Three Dollar Bill", artista: "Limp Bizkit", imagem: "/albums/dollarbill.jfif" },
  { nome: "Vulgar Display of Power", artista: "Pantera", imagem: "/albums/vulgar.jpg" },
  { nome: "The Dark Side of the Moon", artista: "Pink Floyd", imagem: "/albums/darkside.png" },
  { nome: "Significant Other1", artista: "Limp Bizkit", imagem: "/albums/album1.jpg" },
  { nome: "Clint Eastwood1", artista: "Gorillaz", imagem: "/albums/clint.jfif" },
  { nome: "Diamond Eyes1", artista: "Deftones", imagem: "/albums/diamond-eyes.avif" },
];

const artistas = [
  { nome: "Limp Bizkit", genero: "Nu metal", imagem: "/albums/album1.jpg" },
  { nome: "Gorillaz", genero: "Alternative / Electronic", imagem: "/albums/clint.jfif" },
  { nome: "Deftones", genero: "Alternative metal", imagem: "/albums/diamond-eyes.avif" },
  { nome: "Pantera", genero: "Groove metal", imagem: "/albums/vulgar.jpg" },
  { nome: "Pink Floyd", genero: "Progressive rock", imagem: "/albums/darkside.png" },
  { nome: "Limp Bizkit1", genero: "Nu metal", imagem: "/albums/album1.jpg" },
  { nome: "Gorillaz1", genero: "Alternative / Electronic", imagem: "/albums/clint.jfif" },
  { nome: "Deftones1", genero: "Alternative metal", imagem: "/albums/diamond-eyes.avif" }
];

const reviews = [
  {
    id: 1,
    album: "Significant Other",
    artista: "Limp Bizkit",
    imagem: "/albums/album1.jpg",
    texto: '"Significant Other" mistura peso, atitude e melodias marcantes. Um álbum que captura muito bem a energia do nu metal.',
    curtidas: 24,
  },
  {
    id: 2,
    album: "The Dark Side of the Moon",
    artista: "Pink Floyd",
    imagem: "/albums/darkside.png",
    texto: "Uma viagem sonora que conecta atmosfera, emoção e experimentação. Um disco para ouvir do começo ao fim.",
    curtidas: 38,
  },
  {
    id: 3,
    album: "Diamond Eyes",
    artista: "Deftones",
    imagem: "/albums/diamond-eyes.avif",
    texto: "Peso e delicadeza dividem espaço em um som envolvente. As guitarras e os vocais criam uma atmosfera única.",
    curtidas: 17,
  },
  {
    id: 4,
    album: "Clint Eastwood",
    artista: "Gorillaz",
    imagem: "/albums/clint.jfif",
    texto: "Uma mistura característica de hip-hop, eletrônica e melodia alternativa que continua soando original.",
    curtidas: 12,
  },
];

const descobertas = [
  {
    titulo: "Em breve",
    descricao: "Fique de olho no que vem por aí",
    itens: [
      { nome: "Pink Floyd", imagem: "/albums/darkside.png" },
      { nome: "Deftones", imagem: "/albums/diamond-eyes.avif" },
      { nome: "Black Sabbath", imagem: "/albums/vulgar.jpg" },
      { nome: "Gorillaz", imagem: "/albums/clint.jfif" },
    ],
  },
  {
    titulo: "Mais aguardados",
    descricao: "Artistas que movimentam a comunidade",
    itens: [
      { nome: "Deftones", imagem: "/albums/diamond-eyes.avif" },
      { nome: "Metallica", imagem: "/albums/vulgar.jpg" },
      { nome: "Nirvana", imagem: "/albums/darkside.png" },
      { nome: "Limp Bizkit", imagem: "/albums/album1.jpg" },
    ],
  },
  {
    titulo: "Joias escondidas",
    descricao: "Explore novos sons e referências",
    itens: [
      { nome: "Pink Floyd", imagem: "/albums/darkside.png" },
      { nome: "Pantera", imagem: "/albums/vulgar.jpg" },
      { nome: "Radiohead", imagem: "/albums/clint.jfif" },
      { nome: "Deftones", imagem: "/albums/diamond-eyes.avif" },
    ],
  },
];

function TituloSecao({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-3">
      <div className="mt-1 h-8 w-1 shrink-0 rounded-full bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.35)]" />
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {titulo}
        </h2>
        {descricao && (
          <p className="mt-1 text-sm text-neutral-500">{descricao}</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* Fundo limitado à área superior */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[650px] bg-cover bg-top bg-no-repeat opacity-70"
        style={{ backgroundImage: "url('/background-home.webp')" }}
      />

      {/* Degradê para melhorar a leitura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[850px] bg-gradient-to-b from-black/50 via-[#09090b]/70 to-[#09090b]"
      />

      {/* Brilho roxo principal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 z-0 h-80 w-[min(800px,100%)] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]"
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="px-6 pb-16 pt-20 text-center sm:pb-24 sm:pt-28">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            Sua música. Sua identidade.
          </p>

          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
            Seu mundo musical,
            <span className="mt-1 block text-violet-400">
              em um só lugar.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            Reúna seus artistas favoritos, compartilhe reviews,
            crie listas e descubra pessoas que sentem a música como você.
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            Um espaço para registrar suas descobertas e mostrar sua identidade musical.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/cadastro"
              className="rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              Crie seu perfil
            </Link>

            <a
              href="#albuns"
              className="rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white transition hover:border-violet-500/50 hover:bg-white/10"
            >
              Explorar músicas
            </a>
          </div>

          <div className="mx-auto mt-12 flex max-w-xs items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-500/40" />
            <span className="text-xs tracking-widest text-neutral-500">
              SOUNDPROFILE
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/40" />
          </div>
        </section>

        {/* Navegação: fundo sólido, sem sobrepor o banner */}
        <nav
          aria-label="Navegação da página"
          className="relative z-20 border-y border-white/10 bg-[#09090b] shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
        >
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:justify-center sm:gap-4">
            {navegacao.map((item) => (
              <a
                key={item.nome}
                href={item.href}
                className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 transition hover:bg-violet-500/10 hover:text-white"
              >
                {item.nome}
              </a>
            ))}
          </div>
        </nav>

        {/* Comunidade */}
        <section
          id="comunidade"
          className="scroll-mt-32 border-b border-white/5 bg-neutral-950/40 px-5 py-14 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <TituloSecao
              titulo="Encontre sua comunidade"
              descricao="Conheça pessoas que compartilham seus gostos musicais."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {usuarios.map((usuario, index) => (
                <article
                  key={usuario.usuario}
                  className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-violet-500/[0.06]"
                >
                  <img
                    src={usuario.avatar}
                    alt={`Avatar de ${usuario.nome}`}
                    className="h-14 w-14 shrink-0 rounded-full border border-violet-500/30 object-cover"
                  />

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white group-hover:text-violet-300">
                      {usuario.nome}
                    </h3>
                    <p className="truncate text-sm text-neutral-500">
                      {usuario.usuario}
                    </p>
                    <p className="mt-1 truncate text-xs text-violet-400">
                      {usuario.genero}
                    </p>
                  </div>

                  <span className="ml-auto self-start text-xs text-neutral-600">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Álbuns em alta */}
        <section
          id="albuns"
          className="scroll-mt-32 border-b border-white/5 bg-neutral-900/65 px-5 py-14 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <TituloSecao
              titulo="Álbuns em alta"
              descricao="Discos para colocar na sua próxima sessão de música."
            />

            <div className="flex gap-5 overflow-x-auto pb-5 [scrollbar-color:#7c3aed_#18181b] [scrollbar-width:thin] sm:gap-6">
              {albuns.map((album) => (
                <article
                  key={album.nome}
                  className="group w-40 shrink-0 sm:w-48"
                >
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                    <img
                      src={album.imagem}
                      alt={`Capa de ${album.nome}`}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>

                  <h3 className="mt-3 truncate text-sm font-bold text-white transition group-hover:text-violet-300">
                    {album.nome}
                  </h3>
                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {album.artista}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section
          id="reviews"
          className="scroll-mt-32 border-b border-white/5 bg-[#0b0b0f] px-5 py-14 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <TituloSecao
              titulo="Reviews em destaque"
              descricao="Opiniões, experiências e histórias por trás dos discos."
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-violet-500/30 sm:flex-row sm:gap-5 sm:p-6"
                >
                  <img
                    src={review.imagem}
                    alt={`Capa de ${review.album}`}
                    className="h-28 w-28 shrink-0 rounded-xl object-cover sm:h-36 sm:w-36"
                  />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-3">
                      <img
                        src="/gato.jpg"
                        alt="Avatar de Kuramoto"
                        className="h-10 w-10 shrink-0 rounded-full border border-violet-500/30 object-cover"
                      />

                      <div className="min-w-0">
                        <h3 className="font-bold text-white">Kuramoto</h3>
                        <p className="text-xs text-neutral-500">
                          Review da comunidade
                        </p>
                      </div>

                      <span className="ml-auto shrink-0 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-300">
                        ★ 5/5
                      </span>
                    </div>

                    <h4 className="mt-4 font-semibold text-white">
                      {review.album}
                    </h4>
                    <p className="mt-1 text-xs text-violet-400">
                      {review.artista}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-neutral-400">
                      {review.texto}
                    </p>

                    <div className="mt-5 flex items-center gap-4 border-t border-white/5 pt-4">
                      <button
                        type="button"
                        aria-label={`Curtidas na review de ${review.album}`}
                        className="text-sm text-neutral-400 transition hover:text-violet-400"
                      >
                        ♡ {review.curtidas}
                      </button>

                      <button
                        type="button"
                        className="text-sm text-neutral-400 transition hover:text-violet-400"
                      >
                        💬 Comentar
                      </button>

                      <Link
                        href="/login"
                        className="ml-auto text-sm font-semibold text-violet-400 transition hover:text-violet-300"
                      >
                        Abrir review →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Artistas */}
        <section
          id="artistas"
          className="scroll-mt-32 border-b border-white/5 bg-neutral-900/65 px-5 py-14 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <TituloSecao
              titulo="Artistas em alta"
              descricao="Alguns nomes que merecem espaço na sua biblioteca."
            />

            <div className="flex gap-5 overflow-x-auto pb-5 [scrollbar-color:#7c3aed_#18181b] [scrollbar-width:thin] sm:gap-6">
              {artistas.map((artista) => (
                <article
                  key={artista.nome}
                  className="group w-40 shrink-0 sm:w-48"
                >
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
                    <img
                      src={artista.imagem}
                      alt={`Imagem representativa de ${artista.nome}`}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-3 truncate font-bold text-white transition group-hover:text-violet-300">
                    {artista.nome}
                  </h3>
                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {artista.genero}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Descobertas */}
        <section
          id="descobertas"
          className="scroll-mt-32 bg-[#0b0b0f] px-5 py-14 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <TituloSecao
              titulo="Descubra novos sons"
              descricao="Encontre sua próxima obsessão musical."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {descobertas.map((coluna) => (
                <div
                  key={coluna.titulo}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
                >
                  <h3 className="text-lg font-bold text-white">
                    {coluna.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {coluna.descricao}
                  </p>

                  <div className="mt-6 flex flex-col gap-4">
                    {coluna.itens.map((artista, index) => (
                      <div
                        key={`${coluna.titulo}-${artista.nome}-${index}`}
                        className="group flex items-center gap-4"
                      >
                        <img
                          src={artista.imagem}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-lg object-cover transition group-hover:ring-1 group-hover:ring-violet-500/60"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-neutral-200 transition group-hover:text-violet-300">
                            {artista.nome}
                          </h4>
                          <p className="mt-1 text-xs text-neutral-500">
                            Sugestão musical
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className="text-lg text-violet-500/70 transition group-hover:translate-x-1 group-hover:text-violet-300"
                        >
                          →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="relative overflow-hidden border-t border-violet-500/15 px-6 py-16 text-center sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[min(600px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/15 blur-[100px]"
          />

          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Sua música merece um lugar.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
              Crie seu perfil, organize suas descobertas e compartilhe
              seu universo musical com outras pessoas.
            </p>

            <Link
              href="/cadastro"
              className="mt-8 inline-flex rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              Faça parte do SoundProfile
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}


import Link from 'next/link';

export default function MembrosPage() {
    const membrosPrincipais = [
        { nome: 'Nome do Membro', imagem: '/naruto.jpg' },
        { nome: 'Nome do Membro', imagem: '/sasuke.jpg' },
        { nome: 'Nome do Membro', imagem: '/naruto.jpg' },
        { nome: 'Nome do Membro', imagem: '/sasuke.jpg' }
    ];

    const membros = [
        { nome: 'Senhor avaliações', usuario: 'Se existo logo avalio', imagem: '/avatar1.png' },
        { nome: 'Linkando', usuario: 'lalalCanteUmaCanção', imagem: '/avatar2.png' },
        { nome: 'Usuário 3', usuario: '@usuario3', imagem: '/naruto.jpg' },
        { nome: 'Usuário 4', usuario: '@usuario4', imagem: '/sasuke.jpg' },
        { nome: 'Usuário 5', usuario: '@usuario5', imagem: '/sasuke.jpg' },
        { nome: 'Usuário 6', usuario: '@usuario6', imagem: '/sasuke.jpg' },
        { nome: 'Usuário 7', usuario: '@usuario7', imagem: '/sasuke.jpg' },
        { nome: 'Usuário 8', usuario: '@usuario8', imagem: '/sasuke.jpg' },
        { nome: 'Usuário 9', usuario: '@usuario9', imagem: '/sasuke.jpg' }
    ];

    const avaliacoes = [
        {
            usuario: 'Senhor avaliações',
            album: 'Significant Other',
            artista: 'Limp Bizkit',
            imagem: '/albums/album1.jpg',
            nota: 5
        },
        {
            usuario: 'Linkando',
            album: 'Diamond Eyes',
            artista: 'Deftones',
            imagem: '/albums/diamond-eyes.avif',
            nota: 4
        }
    ];

    const ouvirDepois = [
        {
            album: 'The Dark Side of The Moon',
            artista: 'Pink Floyd',
            imagem: '/albums/darkside.png'
        },
        {
            album: 'Vulgar Display of Power',
            artista: 'Pantera',
            imagem: '/albums/vulgar.jpg'
        },
        {
            album: 'Three Dollar Bill',
            artista: 'Limp Bizkit',
            imagem: '/albums/dollarbill.jfif'
        }
    ];

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">

            {/* Fundo original da Home */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px] bg-cover bg-top bg-no-repeat opacity-40"
                style={{ backgroundImage: "url('/background-home.png')" }}
            />

            {/* Degradê para integrar o fundo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[850px] bg-gradient-to-b from-black/40 via-[#09090b]/75 to-[#09090b]"
            />

            {/* Brilhos roxos no fundo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
                {/* Brilho principal no topo */}
                <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[130px]" />

                {/* Brilho suave na lateral esquerda */}
                <div className="absolute top-[500px] -left-40 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />

                {/* Brilho suave na lateral direita */}
                <div className="absolute top-[1000px] -right-40 h-[500px] w-[500px] rounded-full bg-violet-800/10 blur-[140px]" />

                {/* Reflexo roxo na parte inferior */}
                <div className="absolute bottom-[-200px] left-1/3 h-[350px] w-[600px] rounded-full bg-violet-700/10 blur-[130px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-12">

                {/* Título */}
                <div className="flex flex-col items-center text-center">
                    <h1 className="py-6 text-3xl font-bold sm:py-10 sm:text-4xl">
                        Encontre membros populares
                    </h1>

                    <p className="mb-6 max-w-xl text-sm text-neutral-400 sm:text-base">
                        Descubra pessoas, conheça novas avaliações e compartilhe
                        seu gosto musical com a comunidade.
                    </p>

                    <Link
                        href="/pro"
                        className="rounded-xl bg-violet-600 px-6 py-3 font-bold shadow-lg shadow-violet-950/30 transition duration-300 hover:bg-violet-500 hover:shadow-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        Participar da comunidade
                    </Link>
                </div>

                {/* Membros principais */}
                <section className="mt-12">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 lg:gap-12">
                        {membrosPrincipais.map((membro, index) => (
                            <div
                                key={`${membro.imagem}-${index}`}
                                className="group flex flex-col items-center rounded-2xl border border-transparent p-3 transition duration-300 hover:border-white/10 hover:bg-neutral-900/50"
                            >
                                <img
                                    src={membro.imagem}
                                    alt={membro.nome}
                                    className="h-28 w-28 rounded-full border-2 border-violet-500/40 object-cover shadow-lg shadow-black/20 transition duration-300 group-hover:scale-105 group-hover:border-violet-400 sm:h-36 sm:w-36 lg:h-44 lg:w-44"
                                />

                                <h2 className="py-4 text-center text-base font-bold sm:text-lg">
                                    {membro.nome}
                                </h2>

                                <button
                                    type="button"
                                    className="cursor-pointer rounded-xl bg-violet-600 px-6 py-2 font-bold transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                >
                                    Seguir
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Conteúdo principal */}
                <div className="mt-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-10">

                    {/* Avaliadores populares */}
                    <section className="min-w-0 lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold">
                                Avaliadores populares
                            </h2>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-white/10 bg-neutral-800/90 p-3 shadow-xl shadow-black/10 backdrop-blur-sm sm:p-4">
                            {membros.map((membro, index) => (
                                <div
                                    key={`${membro.usuario}-${index}`}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-transparent p-3 transition duration-300 hover:border-violet-500/20 hover:bg-violet-900/20 sm:p-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                                        <img
                                            src={membro.imagem}
                                            alt={membro.nome}
                                            className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-white/10 sm:h-16 sm:w-16"
                                        />

                                        <div className="min-w-0">
                                            <h3 className="truncate font-bold sm:text-lg">
                                                {membro.nome}
                                            </h3>

                                            <p className="break-words text-sm text-neutral-400 sm:text-base">
                                                {membro.usuario}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="shrink-0 cursor-pointer rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 sm:px-5"
                                    >
                                        Seguir
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Lateral direita alinhada com o card */}
                    <aside className="flex min-w-0 flex-col gap-8 lg:pt-[56px]">

                        {/* Avaliações */}
                        <section className="rounded-2xl border border-white/10 bg-neutral-800/90 p-5 shadow-xl shadow-black/10 backdrop-blur-sm transition-colors duration-300 hover:border-violet-500/30 sm:p-6">
                            <h2 className="mb-6 text-2xl font-bold">
                                Avaliações
                            </h2>

                            <div className="flex flex-col gap-5">
                                {avaliacoes.map((avaliacao, index) => (
                                    <div
                                        key={`${avaliacao.album}-${avaliacao.usuario}-${index}`}
                                        className="flex gap-4 border-b border-neutral-700 pb-5 last:border-0 last:pb-0"
                                    >
                                        <img
                                            src={avaliacao.imagem}
                                            alt={`Capa do álbum ${avaliacao.album}`}
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10 sm:h-20 sm:w-20"
                                        />

                                        <div className="min-w-0">
                                            <p className="mb-1 text-sm text-neutral-400">
                                                {avaliacao.usuario}
                                            </p>

                                            <h3 className="font-bold">
                                                {avaliacao.album}
                                            </h3>

                                            <p className="text-sm text-neutral-400">
                                                {avaliacao.artista}
                                            </p>

                                            <div
                                                className="mt-2 flex"
                                                aria-label={`Nota: ${avaliacao.nota} de 5 estrelas`}
                                            >
                                                {[1, 2, 3, 4, 5].map((estrela) => (
                                                    <span
                                                        key={estrela}
                                                        aria-hidden="true"
                                                        className={
                                                            estrela <= avaliacao.nota
                                                                ? 'text-violet-400'
                                                                : 'text-neutral-600'
                                                        }
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="mt-5 font-bold text-violet-400 transition hover:text-violet-300"
                            >
                                Ver todas as avaliações →
                            </button>
                        </section>

                        {/* Ouça depois */}
                        <section className="rounded-2xl border border-white/10 bg-neutral-800/90 p-5 shadow-xl shadow-black/10 backdrop-blur-sm transition-colors duration-300 hover:border-violet-500/30 sm:p-6">
                            <h2 className="mb-6 text-2xl font-bold">
                                Ouça depois
                            </h2>

                            <div className="flex flex-col gap-5">
                                {ouvirDepois.map((album, index) => (
                                    <div
                                        key={`${album.album}-${index}`}
                                        className="flex items-center gap-4 rounded-lg transition hover:bg-white/[0.03]"
                                    >
                                        <img
                                            src={album.imagem}
                                            alt={`Capa do álbum ${album.album}`}
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                                        />

                                        <div className="min-w-0">
                                            <h3 className="font-bold">
                                                {album.album}
                                            </h3>

                                            <p className="text-sm text-neutral-400">
                                                {album.artista}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="mt-5 font-bold text-violet-400 transition hover:text-violet-300"
                            >
                                Ver lista completa →
                            </button>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

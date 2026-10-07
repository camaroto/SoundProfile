import Link from 'next/link';

export default function MembrosPage() {

    const membrosPrincipais = [
        {
            nome: 'Nome do Membro',
            imagem: '/naruto.jpg'
        },
        {
            nome: 'Nome do Membro',
            imagem: '/sasuke.jpg'
        },
        {
            nome: 'Nome do Membro',
            imagem: '/naruto.jpg'
        },
        {
            nome: 'Nome do Membro',
            imagem: '/sasuke.jpg'
        }
    ];

    const membros = [
        {
            nome: 'Senhor avaliações',
            usuario: 'Se existo logo avalio',
            imagem: '/avatar1.png'
        },
        {
            nome: 'Linkando',
            usuario: 'lalalCanteUmaCanção',
            imagem: '/avatar2.png'
        },
        {
            nome: 'Usuário 3',
            usuario: '@usuario3',
            imagem: '/naruto.jpg'
        },
        {
            nome: 'Usuário 4',
            usuario: '@usuario4',
            imagem: '/sasuke.jpg'
        },
        {
            nome: 'Usuário 4',
            usuario: '@usuario4',
            imagem: '/sasuke.jpg'
        },
        {
            nome: 'Usuário 4',
            usuario: '@usuario4',
            imagem: '/sasuke.jpg'
        },
        {
            nome: 'Usuário 4',
            usuario: '@usuario4',
            imagem: '/sasuke.jpg'
        },
        {
            nome: 'Usuário 4',
            usuario: '@usuario4',
            imagem: '/sasuke.jpg'
        },
        {
            nome: 'Usuário 4',
            usuario: '@usuario4',
            imagem: '/sasuke.jpg'
        }
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
        <main className="min-h-screen bg-neutral-900 px-50">

            <div className="py-10">

                {/* TÍTULO */}
                <div className="flex flex-col items-center">

                    <h1 className="text-white py-10 text-4xl font-bold">
                        Encontre membros populares
                    </h1>

                    <Link href="/pro">
                        <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
                            Participar da comunidade
                        </button>
                    </Link>

                </div>


                {/* 4 MEMBROS PRINCIPAIS */}
                <div className="flex justify-center gap-20 mt-12">

                    {membrosPrincipais.map((membro, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center"
                        >

                            <img
                                src={membro.imagem}
                                alt={membro.nome}
                                className="rounded-full w-48 h-48 object-cover"
                            />

                            <h2 className="text-white text-xl font-bold py-5">
                                {membro.nome}
                            </h2>

                            <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-10 rounded-xl cursor-pointer">
                                Seguir
                            </button>

                        </div>
                    ))}

                </div>


                {/* CONTEÚDO ABAIXO DOS 4 MEMBROS */}
                <div className="grid grid-cols-3 gap-10 mt-20">


                    {/* MEMBROS PARA SEGUIR */}
                    <div className="col-span-2">

                        <div className="bg-neutral-900 rounded-2xl">

                            <h1 className="text-white text-2xl font-bold mb-6">
                                Avaliadores populares
                            </h1>

                            <div className="bg-neutral-800 rounded-xl p-2 space-y-6">

                                {membros.map((membro, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-xl p-4 transition-all duration-20 hover:bg-violet-900/40"
                                    >

                                        <div className="flex items-center gap-5">

                                            <img
                                                src={membro.imagem}
                                                alt={membro.nome}
                                                className="w-20 h-20 rounded-full object-cover"
                                            />

                                            <div>

                                                <h2 className="text-white text-xl font-bold">
                                                    {membro.nome}
                                                </h2>

                                                <p className="text-gray-400 text-lg">
                                                    {membro.usuario}
                                                </p>

                                            </div>

                                        </div>

                                        <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl px-7 py-2 cursor-pointer">
                                            Seguir
                                        </button>

                                    </div>
                                ))}

                            </div>

                        </div>

                    </div>


                    {/* LATERAL DIREITA */}
                    <div className="flex flex-col gap-10 pt-14">


                        {/* AVALIAÇÕES */}
                        <div className="bg-neutral-800 rounded-2xl p-6">

                            <h2 className="text-white text-2xl font-bold mb-6">
                                Avaliações
                            </h2>

                            <div className="flex flex-col gap-5">

                                {avaliacoes.map((avaliacao, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4 border-b border-neutral-700 pb-5"
                                    >

                                        <img
                                            src={avaliacao.imagem}
                                            alt={avaliacao.album}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />

                                        <div>

                                            <p className="text-gray-400 text-sm">
                                                {avaliacao.usuario}
                                            </p>

                                            <h3 className="text-white font-bold">
                                                {avaliacao.album}
                                            </h3>

                                            <p className="text-gray-400 text-sm">
                                                {avaliacao.artista}
                                            </p>

                                            <div className="flex mt-2">

                                                {[1, 2, 3, 4, 5].map((estrela) => (
                                                    <span
                                                        key={estrela}
                                                        className={
                                                            estrela <= avaliacao.nota
                                                                ? "text-violet-500"
                                                                : "text-gray-600"
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

                            <button className="text-violet-400 hover:text-violet-300 mt-5 font-bold">
                                Ver todas as avaliações →
                            </button>

                        </div>


                        {/* OUÇA DEPOIS */}
                        <div className="bg-neutral-800 rounded-2xl p-6">

                            <h2 className="text-white text-2xl font-bold mb-6">
                                Ouça depois
                            </h2>

                            <div className="flex flex-col gap-5">

                                {ouvirDepois.map((album, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                    >

                                        <img
                                            src={album.imagem}
                                            alt={album.album}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />

                                        <div>

                                            <h3 className="text-white font-bold">
                                                {album.album}
                                            </h3>

                                            <p className="text-gray-400">
                                                {album.artista}
                                            </p>

                                        </div>

                                    </div>
                                ))}

                            </div>

                            <button className="text-violet-400 hover:text-violet-300 mt-5 font-bold">
                                Ver lista completa →
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}
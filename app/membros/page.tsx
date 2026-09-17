import Link from 'next/link';

export default function MembrosPage() {
    return (
        <main className='bg-neutral-900 px-50'>
            <div className="py-10 flex flex-col items-center justify-center gap-4">
                <h1 className='text-white py-10 text-4xl'>Encontre membros populares</h1>

                <Link href={'/pro'}>
                    <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
                        Participar da comunidade
                    </button>
                </Link>

                <div className='flex gap-25'>

                    {/* perfil 1 */}
                    <div className='py-10 flex flex-col'>
                        <img src="/naruto.jpg" className='rounded-full w-40 h-40' />
                        <h1 className='text-white text-center text-sl py-5'>Nome do Membro</h1>
                        <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
                            Seguir
                        </button>
                    </div>

                    {/* perfil  */}
                    <div className='py-10 flex flex-col'>
                        <img src="/sasuke.jpg" className='rounded-full w-40 h-40' />
                        <h1 className='text-white text-center text-sl py-5'>Nome do Membro</h1>
                        <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
                            Seguir
                        </button>
                    </div>

                    {/* perfil 3 */}
                    <div className='py-10 flex flex-col'>
                        <img src="/naruto.jpg" className='rounded-full w-40 h-40' />
                        <h1 className='text-white text-center text-sl py-5'>Nome do Membro</h1>
                        <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
                            Seguir
                        </button>
                    </div>

                    {/* perfil 4 */}
                    <div className='py-10 flex flex-col'>
                        <img src="/sasuke.jpg" className='rounded-full w-40 h-40' />
                        <h1 className='text-white text-center text-sl py-5'>Nome do Membro</h1>
                        <button className="bg-violet-600 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
                            Seguir
                        </button>
                    </div>

                </div>

                <div className="flex gap-10">

                    <div className="bg-neutral-900 rounded-2xl p-6 w-full">

                        <h1 className="text-white text-3xl font-bold mb-6">
                            Avaliadores populares
                        </h1>

                        <div className="bg-neutral-800 rounded-xl p-7 space-y-6">

                            {/* Avaliador 1 */}
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-4">

                                    <img
                                        src="/avatar1.png"
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />

                                    <div>
                                        <h2 className="text-white text-xl font-bold">
                                            Senhor avaliações
                                        </h2>

                                        <p className="text-gray-400 text-lg font-bold">
                                            Se existo logo avalio
                                        </p>
                                    </div>

                                </div>

                                <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xl rounded-xl px-20 py-5">
                                    Seguir
                                </button>

                            </div>

                            {/* Avaliador 2 */}
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-4">

                                    <img
                                        src="/avatar2.png"
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />

                                    <div>
                                        <h2 className="text-white text-xl font-bold">
                                            Linkando
                                        </h2>

                                        <p className="text-gray-400 text-lg font-bold">
                                            lalalCanteUmaCanção
                                        </p>
                                    </div>

                                </div>

                                <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xl rounded-xl px-20 py-5">
                                    Seguir
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}

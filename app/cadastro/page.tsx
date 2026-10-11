export default function CriarContaPage() {
    return (
        <main className="min-h-[calc(100vh-64px)]">
            <div
                className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-cover bg-center px-4 py-8"
                style={{ backgroundImage: "url('/background-home.png')" }}
            >
                {/* Fundo escuro */}
                <div className="absolute inset-0 bg-black/80" />

                {/* Card */}
                <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 px-6 py-8 shadow-2xl sm:px-8">

                    {/* Título */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white">
                            Criar conta
                        </h1>

                        <p className="mt-2 text-sm text-neutral-400">
                            Faça parte da comunidade SoundProfile
                        </p>
                    </div>

                    {/* Formulário */}
                    <form action="/" method="get" className="flex flex-col gap-5">

                        {/* Nome */}
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-2 block text-sm font-medium text-white"
                            >
                                Nome de usuário
                            </label>

                            <div className="relative">
                                <img
                                    src="/headphone-svgrepo-com.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 brightness-0 invert"
                                />

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Escolha seu username"
                                    autoComplete="username"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-neutral-800 p-3 pl-11 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                                />
                            </div>
                        </div>

                        {/* E-mail */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-white"
                            >
                                E-mail
                            </label>

                            <div className="relative">
                                <img
                                    src="/email-svgrepo-com.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 brightness-0 invert"
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Digite seu e-mail"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-neutral-800 p-3 pl-11 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-white"
                            >
                                Senha
                            </label>

                            <div className="relative">
                                <img
                                    src="/locked-svgrepo-com.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 brightness-0 invert"
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Crie uma senha"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-neutral-800 p-3 pl-11 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                                />
                            </div>

                            <p className="mt-2 text-xs text-neutral-500">
                                A senha deve ter pelo menos 8 caracteres.
                            </p>
                        </div>

                        {/* Link para login */}
                        <p className="text-center text-sm text-neutral-400">
                            Já tem uma conta?{" "}
                            <a
                                href="/login"
                                className="font-semibold text-violet-400 transition hover:text-violet-300"
                            >
                                Entre aqui
                            </a>
                        </p>

                        {/* Botão */}
                        <button
                            type="submit"
                            className="mt-2 w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                        >
                            Criar conta
                        </button>

                    </form>
                </div>
            </div>
        </main>
    );
}
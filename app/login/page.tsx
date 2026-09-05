export default function EntrarConta() {
	return (
		<main className="h-[calc(100vh-64px)] overflow-hidden">
			<div
				className="h-full flex items-center justify-center bg-cover bg-center relative"
				style={{ backgroundImage: "url('/background-home.png')" }}
			>
				{/* Fundo escuro */}
				<div className="absolute inset-0 bg-black/80"></div>

				{/* Card */}
				<div className="relative bg-neutral-900 w-100 h-[50vh] max-h-130 rounded-2xl px-8 pt-4 pb-8 flex flex-col justify-start">

					{/* Título */}
					<h1 className="text-white text-xl font-bold text-center mb-8">
						Entrar
					</h1>

					{/* Formulário */}
					<div className="flex flex-col gap-5">

						<div>
							<label className="text-white block mb-2">
								Nome
							</label>

							<div className="relative">
								<img
									src="/headphone-svgrepo-com.svg"
									alt=""
									className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert"
								/>

								<input
									type="text"
									placeholder="Username"
									className="w-full p-3 pl-11 rounded-lg bg-neutral-700 text-white outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
						</div>

						{/* Senha */}
						<div>
							<label className="text-white block mb-2">
								Senha
							</label>

							<div className="relative">
								<img
									src="/locked-svgrepo-com.svg"
									alt=""
									className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert"
								/>

								<input
									type="password"
									placeholder="Senha"
									className="w-full p-3 pl-11 rounded-lg bg-neutral-700 text-white outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
						</div>

						<h1 className="text-white">Ainda não tem uma conta? <a href="/cadastro" className="text-violet-600 hover:text-violet-500">Cadastre-se</a></h1>

						{/* Botão */}
						<a href="/"
							className="item-center justify-center flex w-full p-3 mt-4 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
						>
							Entrar
						</a>

					</div>

				</div>
			</div>
		</main>
	);
}
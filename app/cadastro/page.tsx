export default function CriarContaPage() {
	return (
		<main className="h-screen overflow-hidden">
			<div
				className="h-screen flex items-center justify-center bg-cover bg-center relative"
				style={{ backgroundImage: "url('/background-home.png')" }}
			>
				{/* Fundo escuro */}
				<div className="absolute inset-0 bg-black/80"></div>

				{/* Card */}
				<div className="relative bg-neutral-900 w-100 h-[90vh] max-h-130 rounded-2xl px-8 pt-4 pb-8 flex flex-col justify-start">

					{/* Título */}
					<h1 className="text-white text-xl font-bold text-center mb-8">
						Cadastrar
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

						{/* E-mail */}
						<div>
							<label className="text-white block mb-2">
								Nome
							</label>

							<div className="relative">
								<img
									src="/email-svgrepo-com.svg"
									alt=""
									className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert"
								/>

								<input
									type="email"
									placeholder="E-mail"
									className="w-full p-3 pl-11 rounded-lg bg-neutral-700 text-white outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
						</div>

						{/* Senha */}
						<div>
							<label className="text-white block mb-2">
								Nome
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

						{/* Botão */}
						<button
							className="w-full p-3 mt-4 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
						>
							Cadastrar
						</button>

					</div>

				</div>
			</div>
		</main>
	);
}
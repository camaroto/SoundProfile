export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background-home.png')" }}
    >
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="relative p-10">
        <h1 className="text-white text-7xl font-bold flex items-center justify-center p-10">
          SoundProfile
        </h1>

        <p className="text-white text-center">
          Conecte Spotify, Apple Music, Youtube Music, SoundCloud e Last.fm.
        </p>

        <p className="text-white text-center">
          Tenha um perfil unificado que mostra sua jornada musical, artistas favoritos e reviews.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <a
            href="/"
            className="block w-fit mx-auto rounded-full bg-violet-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(139,63,251,0.7)] transition hover:brightness-110"
          >
            Crie seu perfil
          </a>
        </div>

        <div className="mt-10 mx-auto justify-center items-center flex flex-wrap gap-10 p-10">
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
          <div className="rounded-xl bg-white h-35 w-100 items-center flex">
            <div className="bg-black w-25 h-25 rounded-full mx-5"></div>
            <p className="text-black font-bold text-lg">Nome do usuário <br /> <p className="text-black font-normal text-sm">@do_usuario</p></p>
          </div>
        </div>
      </div>
    </div>
  );
}
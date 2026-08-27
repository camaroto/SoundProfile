
export default function Home() {
  return (
    <div className="bg-black min-w-screen min-h-200">
      <div className="p-10">
        <h1 className="text-white text-7xl font-bold flex items-center justify-center p-10">SoundProfile</h1>
        <p className="text-white text-center">Conecte Spotify, Apple Music, Youtube Music, SoundCloud e Last.fm.</p>
        <p className="text-white text-center">Tenha um perfil unificado que mostra sua jornada musical, artistas favoritos e reviews.</p>
        <div className="flex items-center justify-center gap-4 mt-10">
        <a
          href="/"
          className="block w-fit mx-auto rounded-full bg-violet-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(139,63,251,0.7)] transition hover:brightness-110"
        >
          Crie seu perfil
        </a>
        </div>
      </div>
    </div>
  );
}
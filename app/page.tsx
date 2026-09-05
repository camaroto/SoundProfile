export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background-home.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 z-0"></div>

      <div className="relative z-10">
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
            href="/cadastro"
            className="block w-fit mx-auto rounded-xl bg-violet-600 px-12 py-4 text-base font-semibold text-white shadow-[0_0_20px_-4px_rgba(139,63,251,0.7)] transition hover:bg-violet-500"
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

        <div className="flex justify-center items-center flex-wrap text-white">
          <a href="/" className="bg-neutral-900 px-4 rounded-xl py-1 border-solid mx-10 border-2 border-violet-500 hover:bg-neutral-800">Social</a>
          <a href="/" className="bg-neutral-900 px-4 rounded-xl py-1 border-solid mx-10 border-2 border-violet-500 hover:bg-neutral-800">Músicas</a>
          <a href="/" className="bg-neutral-900 px-4 rounded-xl py-1 border-solid mx-10 border-2 border-violet-500 hover:bg-neutral-800">Reviews</a>
          <a href="/" className="bg-neutral-900 px-4 rounded-xl py-1 border-solid mx-10 border-2 border-violet-500 hover:bg-neutral-800">Listas</a>
          <a href="/" className="bg-neutral-900 px-4 rounded-xl py-1 border-solid mx-10 border-2 border-violet-500 hover:bg-neutral-800">Rankings</a>
        </div>


        <div className="bg-neutral-900 h-[600px] mt-10 px-50">
        <div className="w-max-screen h-1 bg-violet-900"></div>

          <div className="flex items-center gap-2 p-10">
          <div className="w-1 h-8 bg-violet-600 rounded-full"></div>

          <h1 className="text-white text-xl p-10">
            Álbuns em alta
          </h1>
          </div>

          {/* rolangem horizontal*/}
          <div className="px-22 flex gap-30 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-violet-600 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* album 1*/}
          <div className="flex-shrink-0 w-50 text-center">
            <img 
            src="albums/album1.jpg" 
            className="w-auto h-60 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm font-bold mt-2">
              Significant Other
            </h2>
            <p className="text-gray-400 text-sm">
              Limp Bizkit
            </p>
          </div>
          
          {/* album 2*/}
          <div className="flex-shrink-0 w-50 text-center">
            <img 
            src="albums/clint.jfif" 
            className="w-50 h-60 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm font-bold mt-2">
              Clint Eastwood
            </h2>
            <p className="text-gray-400 text-sm">
              Gorillaz
            </p>
          </div>
         
          {/* album 3*/}
          <div className="flex-shrink-0 w-50 text-center">
            <img 
            src="albums/diamond-eyes.avif" 
            className="w-50 h-60 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm font-bold mt-2">
              Diamond Eyes
            </h2>
            <p className="text-gray-400 text-sm">
              Deftones
            </p>
          </div>
         
          {/* album 4*/}
          <div className="flex-shrink-0 w-50 text-center">
            <img 
            src="albums/dollarbill.jfif" 
            className="w-50 h-60 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm font-bold mt-2">
              Three Dollar Bill
            </h2>
            <p className="text-gray-400 text-sm">
              Limp Bizkit
            </p>
          </div>
         
          {/* album 5*/}
          <div className="flex-shrink-0 w-50 text-center">
            <img 
            src="albums/vulgar.jpg" 
            className="w-50 h-60 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm font-bold mt-2">
              Vulgar Display of Power
            </h2>
            <p className="text-gray-400 text-sm">
              Pantera
            </p>
          </div>
         
          {/* album 6*/}
          <div className="flex-shrink-0 w-50 text-center">
            <img 
            src="albums/darkside.png" 
            className="w-50 h-60 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm font-bold mt-2">
              The Dark Side of The Moon
            </h2>
            <p className="text-gray-400 text-sm">
              Pìnk Floyd
            </p>
          </div>

          </div>
          </div>

      </div>
    </div>
  );
}
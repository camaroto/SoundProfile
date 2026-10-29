"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type Tab = "overview" | "reviews" | "playlists" | "activity";

const albums = [
  {
    title: "White Pony",
    artist: "Deftones",
    rating: 9.5,
    year: "2000",
    image: "/albums/diamond-eyes.avif",
    review:
      "Um álbum que parece um sonho estranho às 3 da manhã. Atmosfera absurda.",
    genre: "Alternative Metal",
  },
  {
    title: "Nevermind",
    artist: "Nirvana",
    rating: 9,
    year: "1991",
    image: "/albums/dollarbill.jfif",
    review:
      "Caótico, sincero e atemporal. Sempre encontro alguma coisa nova aqui.",
    genre: "Grunge",
  },
  {
    title: "Disintegration",
    artist: "The Cure",
    rating: 10,
    year: "1989",
    image: "/albums/darkside.png",
    review:
      "A trilha sonora perfeita para desaparecer do mundo por algumas horas.",
    genre: "Gothic Rock",
  },
  {
    title: "Around the Fur",
    artist: "Deftones",
    rating: 9,
    year: "1997",
    image: "/albums/vulgar.jpg",
    review:
      "Peso, textura e uma energia que continua soando visceral.",
    genre: "Alternative Metal",
  },
  {
    title: "Unknown Pleasures",
    artist: "Joy Division",
    rating: 8.5,
    year: "1979",
    image: "/albums/album1.jpg",
    review:
      "Frio, hipnótico e perfeito para quem gosta de música com sombra.",
    genre: "Post-punk",
  },
  {
    title: "Clint Eastwood",
    artist: "Gorillaz",
    rating: 8,
    year: "2001",
    image: "/albums/clint.jfif",
    review:
      "Uma mistura marcante de groove, melancolia e estranheza.",
    genre: "Alternative",
  },
];

const playlists = [
  {
    title: "midnight thoughts",
    description: "Músicas para quando o sono não vem.",
    image: "/albums/darkside.png",
    tracks: 42,
  },
  {
    title: "purple haze",
    description: "Distorção, melancolia e guitarras.",
    image: "/albums/diamond-eyes.avif",
    tracks: 36,
  },
  {
    title: "the void",
    description: "Um pouco de silêncio no meio do caos.",
    image: "/albums/vulgar.jpg",
    tracks: 28,
  },
];

const artists = [
  {
    name: "Deftones",
    genre: "Alternative Metal",
    image: "/albums/diamond-eyes.avif",
  },
  {
    name: "Nirvana",
    genre: "Grunge",
    image: "/albums/dollarbill.jfif",
  },
  {
    name: "The Cure",
    genre: "Gothic Rock",
    image: "/albums/darkside.png",
  },
  {
    name: "Gorillaz",
    genre: "Alternative",
    image: "/albums/clint.jfif",
  },
];

const avatars = ["/gato.jpg", "/naruto.jpg", "/sasuke.jpg"];

function LocalImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const filename = src.split("/").pop() || src;
  const candidates = Array.from(new Set([src, `/${filename}`]));

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt || "Imagem indisponível"}
        className={`flex items-center justify-center bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 text-violet-300 ${className || ""}`}
      >
        <span className="text-2xl" aria-hidden="true">♫</span>
      </div>
    );
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={alt}
      className={className}
      onError={() => {
        if (candidateIndex < candidates.length - 1) setCandidateIndex((index) => index + 1);
        else setFailed(true);
      }}
    />
  );
}

function GoldRating({ rating }: { rating: number }) {
  const fullDiscs = Math.floor(rating / 2);
  const hasHalfDisc = rating % 2 >= 1;

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Nota ${rating} de 10`}
      title={`${rating}/10`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const filled = index < fullDiscs;
          const half = index === fullDiscs && hasHalfDisc;

          return (
            <span
              key={index}
              className="relative inline-block h-5 w-5 overflow-hidden"
            >
              <LocalImage
                src="/disco-ouro.png"
                alt=""
                className={`absolute inset-0 h-full w-full object-contain ${
                  filled || half ? "" : "opacity-20 grayscale"
                }`}
              />
              {half && (
                <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                  <LocalImage
                    src="/disco-ouro.png"
                    alt=""
                    className="absolute left-[-100%] top-0 h-full w-[200%] max-w-none object-contain"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="ml-1 text-xs font-semibold text-amber-200">{rating.toFixed(rating % 1 ? 1 : 0)}</span>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params?.username || "zynqbr");
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showMore, setShowMore] = useState(false);

  const profile = {
    name: username.toLowerCase() === "zynqbr" ? "Zynq" : username,
    username: `@${username}`,
    bio: "vivendo entre riffs, noites mal dormidas e álbuns que parecem entender tudo.",
    location: "Mato Grosso do Sul, BR",
    joined: "Membro desde 2025",
    avatar: avatars[2],
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Visão geral" },
    { id: "reviews", label: "Reviews" },
    { id: "playlists", label: "Playlists" },
    { id: "activity", label: "Atividade" },
  ];

  const stats = [
    { label: "Seguidores", value: following ? "1.201" : "1.2k" },
    { label: "Seguindo", value: "384" },
    { label: "Reviews", value: "127" },
    { label: "Álbuns ouvidos", value: "86" },
  ];

  const genres = [
    { name: "Alternative Metal", amount: "38%", width: "38%" },
    { name: "Grunge", amount: "27%", width: "27%" },
    { name: "Gothic Rock", amount: "21%", width: "21%" },
    { name: "Shoegaze", amount: "14%", width: "14%" },
  ];

  const activities = [
    {
      action: "Deu nota 9.5 para",
      item: "White Pony",
      time: "há 2 horas",
      image: albums[0].image,
    },
    {
      action: "Adicionou à coleção",
      item: "Disintegration",
      time: "ontem",
      image: albums[2].image,
    },
    {
      action: "Criou a playlist",
      item: "midnight thoughts",
      time: "há 3 dias",
      image: playlists[0].image,
    },
    {
      action: "Atualizou a avaliação de",
      item: "Nevermind",
      time: "há 4 dias",
      image: albums[1].image,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08070d] text-white selection:bg-violet-500/40">
      <div role="note" className="relative z-30 border-b border-amber-400/30 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-200">
        Perfil de demonstração com dados fictícios. Não é uma conta real.
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-[15%] h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[140px]" />
        <div className="absolute right-[-180px] top-[650px] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute left-[-180px] top-[1200px] h-[400px] w-[400px] rounded-full bg-fuchsia-800/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 pb-20 pt-6 sm:px-6 lg:px-10">
        <section className="relative isolate">
          <div className="group relative h-[250px] overflow-hidden rounded-2xl border border-white/10 sm:h-[320px] lg:h-[370px]">
            <LocalImage
              src="/albums/darkside.png"
              alt="Banner musical do perfil"
              className="absolute inset-0 h-full w-full scale-105 object-cover object-center transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#10091e]/95 via-[#160b2d]/65 to-[#09070d]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-[#08070d]/20 to-black/10" />
            <div className="absolute -right-10 top-0 h-72 w-72 rounded-full border border-violet-300/10 bg-violet-500/10 blur-3xl" />
            <div className="absolute right-[20%] top-10 h-40 w-40 rounded-full bg-fuchsia-500/15 blur-[90px]" />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-xl sm:left-7 sm:top-7">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-violet-100/90">
                SoundProfile / User
              </span>
            </div>

            <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl sm:flex">
              <span className="text-xs text-white/50">PROFILE ID</span>
              <span className="font-mono text-xs text-violet-300">
                SP-{username.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile details: avatar overlaps the banner, while the name stays below it. */}
          <div className="relative px-4 sm:px-8">
            <div className="relative -mt-12 flex flex-col gap-5 sm:-mt-14">
              <div className="flex items-end justify-between gap-4">
                <div className="relative h-24 w-24 shrink-0 sm:h-32 sm:w-32">
                  <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-violet-400 via-purple-600 to-fuchsia-500 opacity-80 blur-md" />
                  <div className="relative h-full w-full overflow-hidden rounded-[25px] border border-white/20 bg-[#171020] p-1">
                    <LocalImage
                      src={profile.avatar}
                      alt={`Avatar de ${profile.name}`}
                      className="h-full w-full rounded-[21px] object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-violet-300/30 bg-[#171020] text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 pb-1">
                  <button
                    onClick={() => setFollowing((value) => !value)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 sm:px-5 ${
                      following
                        ? "border border-violet-400/30 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20"
                        : "bg-violet-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:bg-violet-400 hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]"
                    }`}
                  >
                    {following ? <><span>✓</span> Seguindo</> : <><span className="text-lg leading-none">+</span> Seguir</>}
                  </button>
                  <div className="relative">
                    <button
                      aria-label="Mais opções"
                      aria-expanded={showMore}
                      onClick={() => setShowMore((value) => !value)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-white/70 backdrop-blur-xl transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                    >
                      ···
                    </button>
                    {showMore && (
                      <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-white/10 bg-[#171020]/95 p-2 shadow-xl backdrop-blur-xl">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              void navigator.clipboard?.writeText(window.location.href);
                            }
                            setShowMore(false);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/75 hover:bg-white/10"
                        >
                          Copiar link do perfil
                        </button>
                        <button
                          onClick={() => setShowMore(false)}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/75 hover:bg-white/10"
                        >
                          Fechar menu
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-w-0 pb-1 pt-1 sm:pl-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                    Music enthusiast
                  </span>
                  <span className="text-xs text-white/40">✦ Perfil público</span>
                </div>
                <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {profile.name}<span className="ml-2 text-violet-400">.</span>
                </h1>
                <p className="mt-2 text-sm text-white/45">{profile.username}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  {profile.bio}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/40">
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 10h18" />
                    </svg>
                    {profile.joined}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 backdrop-blur-xl transition duration-300 hover:border-violet-400/25 hover:bg-violet-500/[0.045] sm:p-5">
              <p className="text-xs text-white/40">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</p>
              <div className="mt-3 h-px w-8 bg-violet-400/70 transition-all duration-300 group-hover:w-14" />
            </div>
          ))}
        </section>

        <nav className="mt-10 flex gap-6 overflow-x-auto border-b border-white/[0.08] sm:gap-8">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative shrink-0 pb-4 text-sm transition-colors ${activeTab === tab.id ? "font-medium text-white" : "text-white/40 hover:text-white/80"}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />}
            </button>
          ))}
        </nav>

        {activeTab === "overview" && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-10">
              <section>
                <div className="mb-5 flex items-end justify-between">
                  <div><p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-violet-400">On repeat</p><h2 className="text-xl font-semibold sm:text-2xl">Artistas favoritos</h2></div>
                  <button onClick={() => setActiveTab("activity")} className="text-xs text-white/40 transition hover:text-violet-300">Ver atividade ↗</button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {artists.map((artist, index) => (
                    <div key={artist.name} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.045]">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#181321]">
                        <LocalImage src={artist.image} alt={artist.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute left-2 top-2 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white/80 backdrop-blur-md">0{index + 1}</span>
                      </div>
                      <h3 className="mt-3 truncate text-sm font-medium">{artist.name}</h3>
                      <p className="mt-1 truncate text-xs text-white/40">{artist.genre}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between">
                  <div><p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-violet-400">From the collection</p><h2 className="text-xl font-semibold sm:text-2xl">Reviews recentes</h2></div>
                  <button onClick={() => setActiveTab("reviews")} className="text-xs text-white/40 transition hover:text-violet-300">Ver todas ↗</button>
                </div>
                <div className="space-y-3">
                  {albums.slice(0, 3).map((album) => (
                    <article key={album.title} className="group flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 transition duration-300 hover:border-violet-400/25 hover:bg-violet-500/[0.035] sm:gap-5 sm:p-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#171020] sm:h-28 sm:w-28"><LocalImage src={album.image} alt={album.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2"><GoldRating rating={album.rating} /><span className="text-[10px] uppercase tracking-wider text-white/35">{album.genre}</span></div>
                        <h3 className="mt-2 truncate text-base font-semibold sm:text-lg">{album.title}</h3>
                        <p className="mt-0.5 text-xs text-white/45">{album.artist} · {album.year}</p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55 sm:text-sm">{album.review}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between">
                  <div><p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-violet-400">Curated by user</p><h2 className="text-xl font-semibold sm:text-2xl">Playlists em destaque</h2></div>
                  <button onClick={() => setActiveTab("playlists")} className="text-xs text-white/40 transition hover:text-violet-300">Ver todas ↗</button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {playlists.map((playlist) => (
                    <article key={playlist.title} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
                      <div className="relative aspect-[16/10] overflow-hidden"><LocalImage src={playlist.image} alt={playlist.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-black/10 to-transparent" /><div className="absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white/80 backdrop-blur-xl">{playlist.tracks} faixas</div></div>
                      <div className="p-4"><h3 className="font-medium">{playlist.title}</h3><p className="mt-1 text-xs leading-5 text-white/45">{playlist.description}</p></div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.09] via-white/[0.025] to-white/[0.015] p-5 backdrop-blur-2xl">
                <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.2em] text-violet-300">Listening identity</p><span className="text-lg text-violet-300">✳</span></div>
                <h2 className="mt-4 text-xl font-semibold">The Night<br />Wanderer</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">Você procura sons que criam atmosferas, misturam peso com melancolia e transformam qualquer noite em um filme.</p>
                <div className="mt-5 flex flex-wrap gap-2">{["Melancólico", "Atmosférico", "Intenso"].map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] text-white/65">{tag}</span>)}</div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Seus gêneros</h2><span className="text-xs text-white/30">TOP 04</span></div>
                <div className="space-y-4">{genres.map((genre) => <div key={genre.name}><div className="mb-2 flex justify-between gap-2 text-xs"><span className="text-white/70">{genre.name}</span><span className="text-white/35">{genre.amount}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400" style={{ width: genre.width }} /></div></div>)}</div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Atividade recente</h2><span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" /></div>
                <div className="space-y-5">{activities.slice(0, 3).map((activity, index) => <div key={activity.item} className="flex gap-3"><div className="relative flex w-3 shrink-0 justify-center"><span className="mt-1.5 h-2 w-2 rounded-full border border-violet-300/60 bg-violet-400/30" />{index !== 2 && <span className="absolute top-4 h-full w-px bg-white/10" />}</div><div className="min-w-0"><p className="text-xs leading-5 text-white/45">{activity.action}</p><p className="truncate text-sm font-medium text-white/85">{activity.item}</p><p className="mt-1 text-[10px] text-white/30">{activity.time}</p></div></div>)}</div>
                <button onClick={() => setActiveTab("activity")} className="mt-5 w-full rounded-xl border border-white/[0.08] py-2.5 text-xs text-white/50 transition hover:border-violet-400/20 hover:text-violet-300">Ver histórico completo</button>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />
                <p className="relative text-[10px] uppercase tracking-[0.2em] text-white/35">SoundProfile community</p>
                <h3 className="relative mt-3 text-lg font-semibold">Música é melhor<br />quando é compartilhada.</h3>
                <p className="relative mt-2 text-xs leading-5 text-white/45">Descubra novas perspectivas, compartilhe suas reviews e encontre pessoas com o mesmo gosto musical.</p>
                <div className="relative mt-4 flex -space-x-2">{artists.map((artist) => <LocalImage key={artist.name} src={artist.image} alt="" className="h-8 w-8 rounded-full border-2 border-[#100d17] object-cover" />)}<span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#100d17] bg-violet-500/20 text-[9px] text-violet-200">+99</span></div>
              </section>
            </aside>
          </div>
        )}

        {activeTab === "reviews" && (
          <section className="mt-8">
            <div className="mb-6"><p className="text-[10px] uppercase tracking-[0.25em] text-violet-400">The listening archive</p><h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Todas as reviews</h2><p className="mt-2 text-sm text-white/45">Álbuns ouvidos, avaliados e registrados na coleção.</p></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {albums.map((album) => <article key={album.title} className="group flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-violet-400/25 hover:bg-white/[0.04]"><LocalImage src={album.image} alt={album.title} className="h-28 w-28 rounded-xl object-cover" /><div className="min-w-0 flex-1"><GoldRating rating={album.rating} /><h3 className="mt-2 truncate font-semibold">{album.title}</h3><p className="mt-1 text-xs text-white/40">{album.artist} · {album.year}</p><p className="mt-3 line-clamp-3 text-xs leading-5 text-white/55">{album.review}</p></div></article>)}
            </div>
          </section>
        )}

        {activeTab === "playlists" && (
          <section className="mt-8">
            <div className="mb-6"><p className="text-[10px] uppercase tracking-[0.25em] text-violet-400">Personal soundtracks</p><h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Playlists</h2><p className="mt-2 text-sm text-white/45">Coleções para cada momento, humor ou obsessão musical.</p></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{playlists.map((playlist) => <article key={playlist.title} className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition hover:border-violet-400/25"><div className="relative aspect-[16/9] overflow-hidden"><LocalImage src={playlist.image} alt={playlist.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#08070d] to-transparent" /><span className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs backdrop-blur-xl">{playlist.tracks} faixas</span></div><div className="p-5"><h3 className="text-lg font-semibold">{playlist.title}</h3><p className="mt-2 text-sm text-white/45">{playlist.description}</p></div></article>)}</div>
          </section>
        )}

        {activeTab === "activity" && (
          <section className="mt-8 max-w-3xl">
            <div className="mb-6"><p className="text-[10px] uppercase tracking-[0.25em] text-violet-400">Your musical timeline</p><h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Histórico de atividade</h2></div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
              {activities.map((item, index) => <div key={item.item} className={`flex gap-4 pb-6 ${index !== activities.length - 1 ? "border-b border-white/[0.07]" : ""} ${index !== 0 ? "pt-6" : ""}`}><LocalImage src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" /><div className="min-w-0 flex-1"><p className="text-[10px] tracking-[0.15em] text-violet-300/80">{["HOJE · 14:32", "ONTEM · 21:08", "08 OUT · 18:45", "06 OUT · 20:12"][index]}</p><h3 className="mt-1 font-medium">{item.item}</h3><p className="mt-1 text-sm leading-5 text-white/45">{item.action} {index === 0 ? "White Pony e deu nota 9.5." : index === 1 ? "o álbum à sua coleção." : index === 2 ? "uma nova playlist." : "Nevermind."}</p></div><span className="hidden text-lg text-white/25 sm:block">↗</span></div>)}
            </div>
          </section>
        )}

        <footer className="mt-16 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p><span className="font-semibold text-white/55">Sound</span><span className="font-semibold text-violet-400">Profile</span><span className="ml-2">· Your music, your identity.</span></p>
          <p className="font-mono text-[10px] tracking-wider">PROFILE // {username.toUpperCase()}</p>
        </footer>
      </div>
    </main>
  );
}

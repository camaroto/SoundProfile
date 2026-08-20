import Link from "next/link";

export function Header() {
    return (
        <header className="flex px-2 py-4 bg-zinc-500 text-white">
            <div className="flex items-center justify-between w-full mx-auto max-w 7x1">
                <div >
                    Logo
                </div>

                <nav>
                    <ul className="flex items-center justify-center gap-2">
                        <li>
                            Música
                        </li>
                        <li>
                            Membros
                        </li>
                        <li>
                            Listas
                        </li>
                        <li>
                            Pro
                        </li>
                        <Link href="/inscricao">
                            <p className="text-white bg-violet-800 hover:bg-violet-700">Inscreva-se</p>
                        </Link>
                    </ul>
                </nav>

            </div>
        </header>
    );
}
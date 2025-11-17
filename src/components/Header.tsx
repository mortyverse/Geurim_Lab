import Link from "next/link";

export default function Header() {
    return (

        <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    Geurim Lab
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex gap-4">
                        <Link href="/gallery" className="hover:text-gray-300">갤러리</Link>
                        <Link href="/portfolio" className="hover:text-gray-300">포트폴리오</Link>
                    </div>
                    
                    <div className="h-4 w-px bg-gray-600"></div>

                    <div className="flex gap-4">
                        <Link href="/login" className="hover:text-gray-300">로그인</Link>
                        <Link href="/signup" className="hover:text-gray-300">회원가입</Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";


export default function Header() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session} } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        }); 

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        alert("로그아웃 되었습니다.");
        router.push("/");
    };

    return (

        <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    Geurim Lab
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex gap-4">
                        <Link href="/gallery" className="hover:text-gray-300">갤러리</Link>
                        {user && (
                            <Link href="/portfolio" className="hover:text-gray-300">포트폴리오</Link>
                        )}
                    </div>
                    
                    <div className="h-4 w-px bg-gray-600"></div>

                    <div className="flex gap-4 items-center">
                        {user ?(
                            <>
                                <span className = "text-sm text-gray-400 mr-2">
                                    {user.email?.split("@")[0]}님
                                </span>
                                <Link href="/profile" className="hover:texrt-gray-300 text-sm">
                                    프로필
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hever:bg-red-600 text-white px-3 py-1 rounded text-sm transition">
                                    로그아웃
                                </button>
                            </>
                        ):(
                            <>
                                <Link href="/login" className="hover:text-gray-300">
                                    로그인
                                </Link>

                                <Link 
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                                        회원가입
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
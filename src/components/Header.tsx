"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Header() {
    const router = useRouter();

    // 로그인한 사용자 정보를 기억하는 상태 변수
    // <User | null> : User 타입이거나 null일 수 있다는 의미 기본값은 null
    const [user, setUser] = useState<User | null>(null);

    // 컴포넌트가 처음 화면에 나타날 때 실행되는 로직
    useEffect(() => {
        // 현재 로그인된 사용자 정보를 가져오는 함수
        const getUser = async () => {
            const { data: { session} } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        // 로그인/로그아웃 상태가 변경될 때마다 user 상태를 업데이트
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        }); 

        // 컴포넌트가 사라질 때 구독 해제 (메모리 누수 방지)
        return () => subscription.unsubscribe();
    }, []);

    // "로그아웃" 버튼을 눌렀을 때 실행되는 함수
    const handleLogout = async () => {
        await supabase.auth.signOut();
        alert("로그아웃 되었습니다.");
        router.push("/");
    };

    return (
        <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                {/* 로고 - 클릭하면 메인 페이지로 이동 */}
                <Link href="/" className="text-xl font-bold">
                    Geurim Lab
                </Link>
                <div className="flex items-center gap-6">
                    {/* 좌측 메뉴: 갤러리, 포트폴리오 */}
                    <div className="flex gap-4">
                        <Link href="/gallery" className="hover:text-gray-300">갤러리</Link>
                        {/* 로그인한 사용자에게만 포트폴리오 메뉴 표시 */}
                        {user && (
                            <Link href="/portfolio" className="hover:text-gray-300">포트폴리오</Link>
                        )}
                    </div>
                    
                    {/* 구분선 */}
                    <div className="h-4 w-px bg-gray-600"></div>

                    {/* 우측 메뉴: 로그인 상태에 따라 다르게 표시 */}
                    <div className="flex gap-4 items-center">
                        {/* 로그인된 경우 */}
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
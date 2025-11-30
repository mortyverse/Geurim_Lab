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
    const [userRole, setUserRole] = useState<string | null>(null);

    // 컴포넌트가 처음 화면에 나타날 때 실행되는 로직
    useEffect(() => {
        // 현재 로그인된 사용자 정보를 가져오는 함수
        const getUser = async () => {
            const { data: { session} } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            
            // 사용자가 로그인된 경우 역할 정보 조회
            if (session?.user) {
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                console.log('User Role Data:', userData, 'Error:', error); // 디버깅
                setUserRole(userData?.role ?? null);
            } else {
                setUserRole(null);
            }
        };
        getUser();

        // 로그인/로그아웃 상태가 변경될 때마다 user 상태를 업데이트
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            
            // 사용자가 로그인된 경우 역할 정보 조회
            if (session?.user) {
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                console.log('User Role Data (Auth Change):', userData, 'Error:', error); // 디버깅
                setUserRole(userData?.role ?? null);
            } else {
                setUserRole(null);
            }
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
        <header className="bg-white border-b border-gray-200">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* 로고 - 클릭하면 메인 페이지로 이동 */}
                <Link href="/" className="text-xl font-bold text-gray-900">
                    Geurim Lab
                </Link>
                <div className="flex items-center gap-6">
                    {/* 좌측 메뉴: 갤러리, 작품 업로드, 포트폴리오, 1:1 피드백 */}
                    <div className="flex gap-4">
                        <Link href="/gallery" className="text-gray-700 hover:text-gray-900">갤러리</Link>
                        {/* 학생 역할에게만 작품 업로드 메뉴 표시 */}
                        {user && userRole === 'student' && (
                            <Link href="/upload" className="text-gray-700 hover:text-gray-900">작품 업로드</Link>
                        )}
                        {/* 학생 역할에게만 포트폴리오 메뉴 표시 */}
                        {user && userRole === 'student' && (
                            <Link href="/portfolio" className="text-gray-700 hover:text-gray-900">포트폴리오</Link>
                        )}
                        {/* 로그인한 사용자에게 1:1 피드백 메뉴 표시 */}
                        {user && (
                            <Link href="/feedback" className="text-gray-700 hover:text-gray-900">1:1 피드백</Link>
                        )}
                    </div>
                    
                    {/* 구분선 */}
                    <div className="h-4 w-px bg-gray-300"></div>

                    {/* 우측 메뉴: 로그인 상태에 따라 다르게 표시 */}
                    <div className="flex gap-2 items-center">
                        {/* 로그인된 경우 */}
                        {user ?(
                            <>
                                <span className="text-sm text-gray-600 mr-2">
                                    {user.email?.split("@")[0]}님
                                </span>
                                <Link href="/profile" className="text-gray-700 hover:text-gray-900 text-sm">
                                    프로필
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded text-sm font-medium transition">
                                    로그아웃
                                </button>
                            </>
                        ):(
                            <>
                                <Link 
                                    href="/login" 
                                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded text-sm font-medium transition">
                                    로그인
                                </Link>

                                <Link 
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition">
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
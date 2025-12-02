"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
    const router = useRouter();
    const { user, userProfile, signOut } = useAuth();

    // "로그아웃" 버튼을 눌렀을 때 실행되는 함수
    const handleLogout = async () => {
        await signOut();
        alert("로그아웃 되었습니다.");
        router.push("/");
    };

    return (
        <header className="bg-white border-b border-gray-200">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* 로고 - 클릭하면 메인 페이지로 이동 */}
                <Link href="/" className="text-xl font-bold text-gray-900">
                    Grim Lab
                </Link>
                <div className="flex items-center gap-6">
                    {/* 좌측 메뉴: 갤러리, 작품 업로드, 포트폴리오, 1:1 피드백 */}
                    <div className="flex gap-4">
                        <Link href="/gallery" className="text-gray-700 hover:text-gray-900">갤러리</Link>
                        {/* 학생 역할에게만 작품 업로드 메뉴 표시 */}
                        {user && userProfile?.role === 'student' && (
                            <Link href="/upload" className="text-gray-700 hover:text-gray-900">작품 업로드</Link>
                        )}
                        {/* 학생 역할에게만 포트폴리오 메뉴 표시 */}
                        {user && userProfile?.role === 'student' && (
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
                                <div className="flex items-center gap-2 mr-2">
                                    {userProfile?.role && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${
                                            userProfile.role === 'student' 
                                                ? 'bg-blue-500' 
                                                : 'bg-indigo-600'
                                        }`}>
                                            {userProfile.role === 'student' ? '학생' : '멘토'}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-600">
                                        {user.email?.split("@")[0]}님
                                    </span>
                                </div>
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
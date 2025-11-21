"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        name: name.trim(),
                        role: role,
                    }
                }
            });

            if (error) {
                alert("회원가입 실패: " + error.message);
                return;
            }

            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            router.push("/login");
        } catch (err) {
            console.error(err);
            alert("알 수 없는 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg bg-white mt-10">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">회원가입</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                    </label>
                    <input 
                        type="text" 
                        id="name" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required
                        disabled={loading} 
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        이메일
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                        disabled={loading} 
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                        required 
                        minLength={6} 
                        disabled={loading} 
                    />
                    <p className="text-xs text-gray-500 mt-1">6자리 이상 입력해주세요.</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        회원가입 유형
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input 
                                type="radio" 
                                name="role" 
                                value="student" 
                                checked={role === "student"} 
                                onChange={(e) => setRole(e.target.value)} 
                                className="focus:ring-blue-500" 
                                disabled={loading} 
                            />
                            <span className="ml-2 text-sm text-gray-700">학생</span>
                        </label>
                        <label className="flex items-center">
                            <input 
                                type="radio" 
                                name="role" 
                                value="mentor" 
                                checked={role === "mentor"} 
                                onChange={(e) => setRole(e.target.value)} 
                                className="focus:ring-blue-500" 
                                disabled={loading}
                            />
                            <span className="ml-2 text-sm text-gray-700">멘토</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {loading ? "회원가입 중..." : "회원가입"}
                </button>

                <p className="text-sm text-center text-gray-600 mt-4">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        로그인하기
                    </Link>
                </p>
            </form>
        </div>
    );
}
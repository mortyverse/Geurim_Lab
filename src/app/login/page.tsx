"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                alert("로그인 실패: " + error.message);
                return;
            }

            router.push("/");
        } catch (err) {
            console.error(err);
            alert("로그인 중 알 수 없는 오류가 발생했습니다.")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg bg-white mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">로그인</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 b=mb-1">
                        이메일
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-gray-900" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                        disabled={loading}
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 b=mb-1">
                        비밀번호
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-gray-900" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                        disabled={loading}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {loading ? "로그인 중..." : "로그인"}
                </button>

                <p className="text-sm text-center text-gray-600 mt-4">
                    계정이 없으신가요?{" "}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        회원가입하기
                    </Link>
                </p>
            </form>
        </div>
    );
}
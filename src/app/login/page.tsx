"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: 7일차에 Supabase 로그인 로직 추가
        console.log("로그인 시도 : ", { email, password });
    };

    return (
        <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg bg-white mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">로그인</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 b=mb-1">
                        이메일
                    </label>
                    <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 b=mb-1">
                        비밀번호
                    </label>
                    <input type="password" id="password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    로그인
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
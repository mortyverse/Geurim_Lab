"use client";

import { use, useState } from "react";
import Link from "next/link";

export default function SignupPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("student");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("회원가입 시도", { email, password, name, role })
    }

    return (
        <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg bg-white mt-10">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">회원가입</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                    </label>
                    <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        이메일
                    </label>
                    <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호
                    </label>
                    <input type="password" id="password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        회원가입 유형
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input type="radio" name="role" value="student" checked={role === "student"} onChange={(e) => setRole(e.target.value)} className="focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">학생</span>
                        </label>

                        <label className="flex items-center">
                            <input type="radio" name="role" value="mentor" checked={role === "mentor"} onChange={(e) => setRole(e.target.value)} className="focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">멘토</span>
                        </label>
                    </div>
                </div>

                <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                    회원가입
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
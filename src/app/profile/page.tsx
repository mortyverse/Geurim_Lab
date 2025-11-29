'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'mentor';
  is_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // users 테이블에서 사용자 정보 가져오기
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('프로필 로드 에러:', error);
      } else if (data) {
        setUser(data);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">프로필</h1>
      
      {/* 사용자 정보 표시 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
          <p className="text-xl font-semibold">{user.name}</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">역할</label>
          <p className="text-lg">
            {user.role === 'student' ? '학생' : '멘토'}
            {user.is_verified && user.role === 'mentor' && (
              <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">
                인증된 멘토
              </span>
            )}
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">가입일</label>
          <p className="text-gray-800">
            {new Date(user.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* 멘토 인증 서류 업로드 UI (F-07에서 구현 예정) */}
      {user.role === 'mentor' && !user.is_verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">멘토 인증</h2>
          <p className="text-gray-700 mb-4">
            멘토 인증을 받으려면 증명 서류를 업로드해주세요.
          </p>
          <p className="text-sm text-gray-500">
            * 이 기능은 곧 추가될 예정입니다 (F-07)
          </p>
        </div>
      )}
    </div>
  );
}

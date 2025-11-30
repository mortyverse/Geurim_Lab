'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PortfolioPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        // 현재 로그인한 사용자 확인
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // 사용자 이름 가져오기
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserName(userData.name);
        }

        // 본인이 작성한 작품만 조회
        const { data: myPosts, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('작품 조회 오류:', error);
        } else {
          setPosts(myPosts || []);
        }
      } catch (err) {
        console.error('오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {userName ? `${userName}님의 포트폴리오` : '내 포트폴리오'}
          </h1>
          <p className="text-gray-600">업로드한 작품 {posts.length}개</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-gray-200 hover:shadow-sm transition-shadow">
            <p className="text-gray-500 text-lg mb-4">아직 업로드한 작품이 없습니다.</p>
            <Link
              href="/upload"
              className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 transition-colors"
            >
              첫 작품 업로드하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group bg-white rounded border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-300"
              >
                <div className="relative w-full h-64 bg-gray-200">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

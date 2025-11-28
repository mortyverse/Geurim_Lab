import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default async function GalleryPage() {
  // posts 테이블에서 작품 목록 조회 (최신순)
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      description,
      image_url,
      created_at,
      users (
        name,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('작품 목록 조회 오류:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">작품 갤러리</h1>
          <p className="text-gray-600">학생들이 업로드한 작품을 감상해보세요</p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">아직 업로드된 작품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
                  {post.users && Array.isArray(post.users) && post.users[0] && (
                    <p className="text-sm text-gray-600">
                      by {post.users[0].name}
                    </p>
                  )}
                  {post.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

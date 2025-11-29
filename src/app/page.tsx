import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function Home() {
  // 최신 작품 4개 가져오기
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Geurim Lab
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          미술 학생과 멘토를 위한 피드백 커뮤니티
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/gallery"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            갤러리 보기
          </Link>
          <Link
            href="/signup"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            시작하기
          </Link>
        </div>
      </section>

      {/* 최근 작품 섹션 */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">최근 업로드된 작품</h2>
            <Link
              href="/gallery"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              더 보기 →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPosts.map((post) => (
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
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 서비스 특징 섹션 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Geurim Lab의 특징
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* 특징 1 */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">작품 공유</h3>
            <p className="text-gray-600">
              나의 작품을 업로드하고 다른 사람들과 공유하세요
            </p>
          </div>

          {/* 특징 2 */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">전문가 피드백</h3>
            <p className="text-gray-600">
              인증된 멘토로부터 전문적인 피드백을 받아보세요
            </p>
          </div>

          {/* 특징 3 */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">포트폴리오 관리</h3>
            <p className="text-gray-600">
              나만의 작품 포트폴리오를 구성하고 관리하세요
            </p>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-lg mb-8 opacity-90">
            무료로 가입하고 커뮤니티에 참여하세요
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            회원가입
          </Link>
        </div>
      </section>
    </div>
  );
}

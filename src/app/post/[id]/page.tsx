import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FeedbackForm from '@/components/FeedbackForm';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 작품 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      user:users (
        name,
        role
      )
    `)
    .eq('id', id)
    .single();

  if (postError || !post) {
    notFound();
  }

  // 피드백 목록 조회 (작성자 정보 포함)
  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select(`
      *,
      user:users (
        name,
        role,
        is_verified
      )
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 뒤로 가기 버튼 */}
        <Link 
          href="/gallery" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          갤러리로 돌아가기
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 작품 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* 작품 이미지 */}
              <div className="w-full bg-gray-100 flex items-center justify-center">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>

              {/* 작품 정보 */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                
                {/* 작성자 정보 */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {post.user?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.user?.name || '알 수 없음'}</p>
                    <p className="text-sm text-gray-500">
                      {post.user?.role === 'student' ? '학생' : '멘토'}
                    </p>
                  </div>
                </div>

                {/* 작품 설명 */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">작품 설명</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.description || '설명이 없습니다.'}
                  </p>
                </div>

                {/* 업로드 날짜 */}
                <p className="text-sm text-gray-500 mt-4">
                  업로드: {new Date(post.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 피드백 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                피드백 {feedbacks ? `(${feedbacks.length})` : '(0)'}
              </h2>

              {/* 피드백 작성 폼 */}
              <FeedbackForm postId={id} />

              {/* 피드백 목록 */}
              <div className="mt-6 space-y-4">
                {feedbacks && feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        {/* 작성자 아바타 */}
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold">
                            {feedback.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* 작성자 정보 */}
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {feedback.user?.name || '알 수 없음'}
                            </p>
                            
                            {/* 인증 멘토 배지 */}
                            {feedback.user?.is_verified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                인증 멘토
                              </span>
                            )}
                          </div>

                          {/* 피드백 내용 */}
                          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-2">
                            {feedback.content}
                          </p>

                          {/* 작성 시간 */}
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.created_at).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    아직 피드백이 없습니다.<br />
                    첫 번째 피드백을 남겨보세요!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

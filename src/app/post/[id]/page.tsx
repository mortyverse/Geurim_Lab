import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackItem from '@/components/FeedbackItem';
import PostActions from '@/components/PostActions';

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
    .select('*, users(*)')
    .eq('post_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        {/* 작품 정보 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* 작품 이미지 */}
          <div className="w-full bg-gray-100 flex items-center justify-center">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-auto max-h-[700px] object-contain"
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

            {/* 수정/삭제 버튼 (본인 작품인 경우만 표시) */}
            <PostActions 
              postId={id} 
              postUserId={post.user_id}
              postTitle={post.title}
            />
          </div>
        </div>

        {/* 피드백 섹션 */}
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
                <FeedbackItem
                  key={feedback.id}
                  feedback={feedback}
                />
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
  );
}

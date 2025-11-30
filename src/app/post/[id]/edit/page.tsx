'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [postId, setPostId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      // params Promise 처리
      const resolvedParams = await params;
      setPostId(resolvedParams.id);

      // 로그인 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 작품 정보 로드
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error || !post) {
        alert('작품을 찾을 수 없습니다.');
        router.push('/gallery');
        return;
      }

      // 본인 작품인지 확인
      if (post.user_id !== session.user.id) {
        alert('본인의 작품만 수정할 수 있습니다.');
        router.push(`/post/${resolvedParams.id}`);
        return;
      }

      setTitle(post.title);
      setDescription(post.description || '');
      setImageUrl(post.image_url);
      setLoading(false);
    };

    initializePage();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          description: description.trim(),
        })
        .eq('id', postId);

      if (error) throw error;

      alert('작품이 수정되었습니다.');
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error('수정 오류:', error);
      alert('작품 수정에 실패했습니다.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">작품 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded border border-gray-200 hover:shadow-sm transition-shadow">
          {/* 현재 이미지 표시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 이미지 (변경 불가)
            </label>
            <div className="w-full h-64 bg-gray-100 rounded overflow-hidden">
              <img
                src={imageUrl}
                alt="현재 작품"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              * 이미지는 수정할 수 없습니다. 이미지를 변경하려면 새로운 작품을 업로드해주세요.
            </p>
          </div>

          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="작품 제목을 입력하세요"
            />
          </div>

          {/* 설명 입력 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              placeholder="작품에 대한 설명을 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? '수정 중...' : '수정 완료'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/post/${postId}`)}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

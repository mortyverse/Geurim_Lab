'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface FeedbackFormProps {
  postId: string;
}

export default function FeedbackForm({ postId }: FeedbackFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('피드백 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 현재 로그인된 사용자 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('로그인이 필요합니다.');
        setIsSubmitting(false);
        return;
      }

      // 피드백 저장
      const { error: insertError } = await supabase
        .from('feedbacks')
        .insert({
          content: content.trim(),
          post_id: postId,
          user_id: session.user.id
        });

      if (insertError) {
        throw insertError;
      }

      // 성공 시 폼 초기화 및 페이지 새로고침
      setContent('');
      router.refresh();
      
    } catch (err) {
      console.error('피드백 작성 실패:', err);
      setError('피드백 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="이 작품에 대한 피드백을 남겨주세요..."
        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
        rows={4}
        disabled={isSubmitting}
      />
      
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="mt-3 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '작성 중...' : '피드백 작성'}
      </button>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PostActionsProps {
  postId: string;
  postUserId: string;
  postTitle: string;
}

export default function PostActions({ postId, postUserId, postTitle }: PostActionsProps) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setCurrentUserId(session.user.id);
      }
      setLoading(false);
    };
    fetchSession();
  }, [postUserId]);

  // 로딩 중일 때는 아무것도 표시하지 않음
  if (loading) {
    return null;
  }

  // 본인 작품이 아니면 버튼을 표시하지 않음
  if (!currentUserId || currentUserId !== postUserId) {
    return null;
  }

  const handleDelete = async () => {
    const confirmMessage = `정말로 "${postTitle}" 작품을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 피드백도 함께 삭제됩니다.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      // 1. 먼저 관련 피드백 삭제
      const { error: feedbackError } = await supabase
        .from('feedbacks')
        .delete()
        .eq('post_id', postId);

      if (feedbackError) {
        console.error('피드백 삭제 오류:', feedbackError);
        throw feedbackError;
      }

      // 2. 작품 삭제
      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (postError) {
        console.error('작품 삭제 오류:', postError);
        throw postError;
      }

      alert('작품이 삭제되었습니다.');
      router.push('/portfolio');
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      alert('작품 삭제에 실패했습니다. 다시 시도해주세요.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
      <Link
        href={`/post/${postId}/edit`}
        className="flex-1 bg-blue-600 text-white text-center font-semibold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {isDeleting ? '삭제 중...' : '삭제'}
      </button>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface FeedbackItemProps {
  feedback: {
    id: number;
    content: string;
    created_at: string;
    user_id: string;
    users?: {
      name: string;
      role: string;
      is_verified: boolean;
    };
  };
}

export default function FeedbackItem({ feedback }: FeedbackItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(feedback.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id);
    };
    getCurrentUser();
  }, []);

  const isOwner = currentUserId === feedback.user_id;

  const handleUpdate = async () => {
    if (!editedContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ content: editedContent.trim() })
        .eq('id', feedback.id);

      if (error) throw error;

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error('피드백 수정 실패:', err);
      alert('피드백 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 피드백을 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedback.id);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error('피드백 삭제 실패:', err);
      alert('피드백 삭제에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(feedback.content);
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* 작성자 아바타 */}
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 font-semibold">
            {feedback.users?.name?.charAt(0) || '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* 작성자 정보 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm">
                {feedback.users?.name || '알 수 없음'}
              </p>
              
              {/* 인증 멘토 배지 */}
              {feedback.users?.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  인증 멘토
                </span>
              )}
            </div>

            {/* 수정/삭제 버튼 (본인 댓글만) */}
            {isOwner && !isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  disabled={isSubmitting}
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-800"
                  disabled={isSubmitting}
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 피드백 내용 */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 text-sm"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting || !editedContent.trim()}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:cursor-not-allowed"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-2">
              {feedback.content}
            </p>
          )}

          {/* 작성 시간 */}
          {!isEditing && (
            <p className="text-xs text-gray-500">
              {new Date(feedback.created_at).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

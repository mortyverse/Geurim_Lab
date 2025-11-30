'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LikeButtonProps {
  postId: number;
  initialLikesCount: number;
}

export default function LikeButton({ postId, initialLikesCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfLiked();
  }, [postId]);

  const checkIfLiked = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <button className="flex items-center gap-2 text-gray-500" disabled>
        <span>❤️</span>
        <span>{likesCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 transition-colors ${
        isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      }`}
    >
      <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
      <span className="font-semibold">{likesCount}</span>
    </button>
  );
}

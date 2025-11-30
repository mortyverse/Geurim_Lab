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
      
      // 실제 likes_count 가져오기
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      
      if (postData) {
        setLikesCount(postData.likes_count || 0);
      }
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
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        setIsLiked(true);
      }

      // 트리거가 업데이트한 실제 likes_count 가져오기
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      
      if (postData) {
        setLikesCount(postData.likes_count || 0);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <button className="flex items-center gap-2 text-gray-400" disabled>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">{likesCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 transition-all duration-200 ${
        isLiked 
          ? 'text-blue-500 hover:text-blue-600' 
          : 'text-gray-400 hover:text-blue-500'
      }`}
    >
      <svg 
        className={`w-6 h-6 transition-transform ${isLiked ? 'scale-110' : 'hover:scale-110'}`} 
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isLiked ? 0 : 2}
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span className="font-semibold text-lg">{likesCount}</span>
    </button>
  );
}

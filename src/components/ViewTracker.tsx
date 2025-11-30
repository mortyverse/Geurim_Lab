'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ViewTrackerProps {
  postId: number;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        // 조회수 증가 (RPC 함수 사용)
        const { error } = await supabase.rpc('increment_post_views', { post_id: postId });

        if (error) {
          console.error('Error incrementing view count:', error);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    incrementViewCount();
  }, [postId]);

  return null; // UI를 렌더링하지 않음
}

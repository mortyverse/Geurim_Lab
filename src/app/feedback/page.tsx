'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  OneOnOneFeedback, 
  STATUS_LABELS, 
  STATUS_COLORS,
  getNextActor 
} from '@/types/feedback';

interface User {
  id: string;
  name: string;
  role: 'student' | 'mentor';
}

export default function FeedbackListPage() {
  const [feedbacks, setFeedbacks] = useState<OneOnOneFeedback[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        // 현재 로그인 사용자 확인
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setLoading(false);
          return;
        }

        // 사용자 정보 조회
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, role')
          .eq('id', authUser.id)
          .single();

        if (userError || !userData) {
          setLoading(false);
          return;
        }

        setCurrentUser(userData as User);

        // 피드백 목록 조회 (RLS로 자동 필터링됨)
        const { data: feedbacksData, error: feedbackError } = await supabase
          .from('one_on_one_feedbacks')
          .select(`
            *,
            student:users!student_id(id, name, role),
            mentor:users!mentor_id(id, name, role, is_verified)
          `)
          .order('updated_at', { ascending: false });

        if (!feedbackError && feedbacksData) {
          setFeedbacks(feedbacksData as OneOnOneFeedback[]);
        }
      } catch (err) {
        console.error('데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 필터링된 피드백 목록
  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'pending') return f.status !== 'completed';
    if (filter === 'completed') return f.status === 'completed';
    return true;
  });

  // 내 차례인지 확인
  const isMyTurn = (feedback: OneOnOneFeedback): boolean => {
    if (!currentUser) return false;
    const nextActor = getNextActor(feedback.status);
    if (!nextActor) return false;
    
    if (nextActor === 'student' && currentUser.id === feedback.student_id) return true;
    if (nextActor === 'mentor' && currentUser.id === feedback.mentor_id) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">1:1 피드백</h1>
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">1:1 피드백</h1>
          
          {/* 학생인 경우 새 요청 버튼 */}
          {currentUser.role === 'student' && (
            <Link
              href="/feedback/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              새 피드백 요청
            </Link>
          )}
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'all', label: '전체' },
            { key: 'pending', label: '진행 중' },
            { key: 'completed', label: '완료' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
                filter === key
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 피드백 목록 */}
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {filter === 'all' 
              ? '아직 피드백이 없습니다.'
              : filter === 'pending'
              ? '진행 중인 피드백이 없습니다.'
              : '완료된 피드백이 없습니다.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <Link
                key={feedback.id}
                href={`/feedback/${feedback.id}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* 썸네일 */}
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={feedback.step1_image_url}
                      alt="작품 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* 상태 배지 */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[feedback.status]}`}>
                        {STATUS_LABELS[feedback.status]}
                      </span>
                      
                      {/* 내 차례 표시 */}
                      {isMyTurn(feedback) && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium animate-pulse">
                          내 차례
                        </span>
                      )}
                    </div>

                    {/* 참여자 정보 */}
                    <div className="text-sm text-gray-600 mb-1">
                      {currentUser.role === 'student' ? (
                        <>멘토: {feedback.mentor?.name || '알 수 없음'}</>
                      ) : (
                        <>학생: {feedback.student?.name || '알 수 없음'}</>
                      )}
                    </div>

                    {/* 내용 미리보기 */}
                    <p className="text-gray-700 text-sm truncate">
                      {feedback.step1_content}
                    </p>

                    {/* 날짜 */}
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(feedback.updated_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* 화살표 */}
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

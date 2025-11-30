'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  OneOnOneFeedback, 
  FeedbackStatus, 
  STATUS_LABELS, 
  STATUS_COLORS,
  getNextActor,
  getNextStatus 
} from '@/types/feedback';
import DrawingCanvas from './DrawingCanvas';

interface FeedbackDetailViewProps {
  feedbackId: number;
}

interface User {
  id: string;
  name: string;
  role: 'student' | 'mentor';
}

export default function FeedbackDetailView({ feedbackId }: FeedbackDetailViewProps) {
  const [feedback, setFeedback] = useState<OneOnOneFeedback | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // 입력 상태
  const [inputContent, setInputContent] = useState('');
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [drawnImageDataUrl, setDrawnImageDataUrl] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        // 현재 로그인 사용자 확인
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setError('로그인이 필요합니다.');
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
          setError('사용자 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        setCurrentUser(userData as User);

        // 피드백 데이터 조회
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('one_on_one_feedbacks')
          .select(`
            *,
            student:users!student_id(id, name, role),
            mentor:users!mentor_id(id, name, role, is_verified)
          `)
          .eq('id', feedbackId)
          .single();

        if (feedbackError || !feedbackData) {
          setError('피드백을 찾을 수 없거나 접근 권한이 없습니다.');
          setLoading(false);
          return;
        }

        setFeedback(feedbackData as OneOnOneFeedback);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [feedbackId]);

  // 현재 사용자의 역할 확인
  const getUserRole = (): 'student' | 'mentor' | null => {
    if (!currentUser || !feedback) return null;
    if (currentUser.id === feedback.student_id) return 'student';
    if (currentUser.id === feedback.mentor_id) return 'mentor';
    return null;
  };

  // 현재 사용자가 행동해야 하는지 확인
  const isMyTurn = (): boolean => {
    const userRole = getUserRole();
    if (!userRole || !feedback) return false;
    return getNextActor(feedback.status) === userRole;
  };

  // 이미지 업로드 (data URL -> Supabase Storage)
  const uploadImage = async (dataUrl: string): Promise<string> => {
    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `${feedbackId}/${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from('one-on-one-feedbacks')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('one-on-one-feedbacks')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  // 답변/질문 제출
  const handleSubmit = async () => {
    if (!feedback || !currentUser || !isMyTurn()) return;
    
    const userRole = getUserRole();
    const nextStatus = getNextStatus(feedback.status);
    if (!nextStatus) return;

    // 유효성 검사
    if (!inputContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // 멘토의 경우 이미지 필수 (Step 2, Step 4)
    if (userRole === 'mentor' && !drawnImageDataUrl) {
      alert('피드백 이미지를 그려주세요.');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | null = null;
      
      // 이미지 업로드 (멘토인 경우)
      if (drawnImageDataUrl) {
        imageUrl = await uploadImage(drawnImageDataUrl);
      }

      // 상태별 업데이트 데이터 구성
      let updateData: Record<string, unknown> = { status: nextStatus };

      switch (feedback.status) {
        case 'pending':
          // Step 2: 멘토의 1차 답변
          updateData = {
            ...updateData,
            step2_content: inputContent,
            step2_image_url: imageUrl,
          };
          break;
        case 'replied_1':
          // Step 3: 학생의 추가 질문
          updateData = {
            ...updateData,
            step3_content: inputContent,
          };
          break;
        case 'questioned_2':
          // Step 4: 멘토의 최종 답변
          updateData = {
            ...updateData,
            step4_content: inputContent,
            step4_image_url: imageUrl,
          };
          break;
      }

      // Supabase 업데이트
      const { error } = await supabase
        .from('one_on_one_feedbacks')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;

      // 상태 갱신
      setFeedback({
        ...feedback,
        ...updateData,
        status: nextStatus,
      } as OneOnOneFeedback);

      // 입력 초기화
      setInputContent('');
      setDrawnImageDataUrl(null);

    } catch (err) {
      console.error('제출 오류:', err);
      alert('제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Canvas에서 그림 저장 시
  const handleDrawingSave = (dataUrl: string) => {
    setDrawnImageDataUrl(dataUrl);
    setShowDrawingCanvas(false);
  };

  // 로딩 / 에러 처리
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error || '피드백을 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  const userRole = getUserRole();

  return (
    <div className="max-w-4xl mx-auto">
      {/* 상태 배지 */}
      <div className="mb-6 flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[feedback.status]}`}>
          {STATUS_LABELS[feedback.status]}
        </span>
        <span className="text-gray-500 text-sm">
          {new Date(feedback.created_at).toLocaleDateString('ko-KR')}
        </span>
      </div>

      {/* 타임라인 형식 대화 표시 */}
      <div className="space-y-6">
        {/* Step 1: 학생의 요청 */}
        <FeedbackStep
          stepNumber={1}
          title="피드백 요청"
          actorName={feedback.student?.name || '학생'}
          actorRole="student"
          content={feedback.step1_content}
          imageUrl={feedback.step1_image_url}
          isCompleted={true}
        />

        {/* Step 2: 멘토의 1차 답변 */}
        {(feedback.step2_content || feedback.status === 'pending') && (
          <FeedbackStep
            stepNumber={2}
            title="1차 피드백"
            actorName={feedback.mentor?.name || '멘토'}
            actorRole="mentor"
            content={feedback.step2_content}
            imageUrl={feedback.step2_image_url}
            isCompleted={!!feedback.step2_content}
            isPending={feedback.status === 'pending'}
          />
        )}

        {/* Step 3: 학생의 추가 질문 */}
        {(feedback.step3_content || feedback.status === 'replied_1') && (
          <FeedbackStep
            stepNumber={3}
            title="추가 질문"
            actorName={feedback.student?.name || '학생'}
            actorRole="student"
            content={feedback.step3_content}
            imageUrl={null}
            isCompleted={!!feedback.step3_content}
            isPending={feedback.status === 'replied_1'}
          />
        )}

        {/* Step 4: 멘토의 최종 답변 */}
        {(feedback.step4_content || feedback.status === 'questioned_2') && (
          <FeedbackStep
            stepNumber={4}
            title="최종 피드백"
            actorName={feedback.mentor?.name || '멘토'}
            actorRole="mentor"
            content={feedback.step4_content}
            imageUrl={feedback.step4_image_url}
            isCompleted={!!feedback.step4_content}
            isPending={feedback.status === 'questioned_2'}
          />
        )}
      </div>

      {/* 입력 폼 영역 */}
      {feedback.status !== 'completed' && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          {isMyTurn() ? (
            <>
              <h3 className="text-lg font-semibold mb-4">
                {userRole === 'mentor' 
                  ? (feedback.status === 'pending' ? '1차 피드백 작성' : '최종 피드백 작성')
                  : '추가 질문 작성'}
              </h3>
              
              {/* 멘토인 경우 그림 그리기 버튼 */}
              {userRole === 'mentor' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    피드백 이미지 *
                  </label>
                  
                  {drawnImageDataUrl ? (
                    <div className="relative inline-block">
                      <img 
                        src={drawnImageDataUrl} 
                        alt="피드백 이미지" 
                        className="max-w-md rounded border border-gray-300"
                      />
                      <button
                        onClick={() => setShowDrawingCanvas(true)}
                        className="absolute top-2 right-2 px-3 py-1 bg-white/90 hover:bg-white text-sm rounded shadow"
                      >
                        다시 그리기
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDrawingCanvas(true)}
                      className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      이미지 위에 피드백 그리기
                    </button>
                  )}
                </div>
              )}

              {/* 텍스트 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userRole === 'mentor' ? '피드백 내용 *' : '질문 내용 *'}
                </label>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={userRole === 'mentor' 
                    ? '학생에게 전달할 피드백을 작성해주세요...'
                    : '멘토에게 추가로 질문할 내용을 작성해주세요...'}
                />
              </div>

              {/* 제출 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '제출 중...' : '제출하기'}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                {userRole === 'student' 
                  ? '멘토의 답변을 기다리는 중입니다...'
                  : '학생의 추가 질문을 기다리는 중입니다...'}
              </div>
              <div className="text-sm text-gray-400">
                상대방이 답변하면 알림을 받을 수 있습니다.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 완료 상태 */}
      {feedback.status === 'completed' && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200 text-center">
          <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800">피드백이 완료되었습니다</h3>
          <p className="text-green-600 mt-1">이 피드백 세션은 종료되었습니다.</p>
        </div>
      )}

      {/* Drawing Canvas Modal */}
      {showDrawingCanvas && (
        <DrawingCanvas
          backgroundImage={
            feedback.status === 'pending' 
              ? feedback.step1_image_url 
              : feedback.step2_image_url || feedback.step1_image_url
          }
          onSave={handleDrawingSave}
          onCancel={() => setShowDrawingCanvas(false)}
        />
      )}
    </div>
  );
}

// 개별 스텝 컴포넌트
interface FeedbackStepProps {
  stepNumber: number;
  title: string;
  actorName: string;
  actorRole: 'student' | 'mentor';
  content: string | null;
  imageUrl: string | null;
  isCompleted: boolean;
  isPending?: boolean;
}

function FeedbackStep({ 
  stepNumber, 
  title, 
  actorName, 
  actorRole, 
  content, 
  imageUrl, 
  isCompleted,
  isPending = false
}: FeedbackStepProps) {
  const bgColor = actorRole === 'student' ? 'bg-blue-50' : 'bg-purple-50';
  const borderColor = actorRole === 'student' ? 'border-blue-200' : 'border-purple-200';
  const avatarColor = actorRole === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600';

  if (isPending && !isCompleted) {
    return (
      <div className="flex gap-4 opacity-50">
        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
          {stepNumber}
        </div>
        <div className="flex-1 p-4 bg-gray-100 rounded-lg border border-gray-200 border-dashed">
          <div className="text-gray-400 text-sm">{title} 대기 중...</div>
        </div>
      </div>
    );
  }

  if (!isCompleted) return null;

  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
        {stepNumber}
      </div>
      <div className={`flex-1 p-4 ${bgColor} rounded-lg border ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="text-sm text-gray-500">{actorName}</span>
        </div>
        
        {imageUrl && (
          <div className="mb-3">
            <img 
              src={imageUrl} 
              alt={`${title} 이미지`}
              className="max-w-full rounded border border-gray-200"
            />
          </div>
        )}
        
        {content && (
          <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}

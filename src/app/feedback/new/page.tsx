'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Mentor {
  id: string;
  name: string;
  is_verified: boolean;
}

export default function NewFeedbackRequestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 폼 상태
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 멘토 목록 로드
  useEffect(() => {
    async function loadMentors() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, is_verified')
          .eq('role', 'mentor')
          .eq('is_verified', true)
          .order('name');

        if (!error && data) {
          setMentors(data);
        }
      } catch (err) {
        console.error('멘토 목록 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, []);

  // 이미지 선택 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setImageFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 삭제
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!selectedMentorId) {
      setError('멘토를 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('질문 내용을 입력해주세요.');
      return;
    }
    if (!imageFile) {
      setError('작품 이미지를 업로드해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 현재 로그인 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('로그인이 필요합니다.');
        setSubmitting(false);
        return;
      }

      // 이미지 업로드
      const fileName = `${user.id}/${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('one-on-one-feedbacks')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('one-on-one-feedbacks')
        .getPublicUrl(uploadData.path);

      // 피드백 요청 생성
      const { data: feedbackData, error: insertError } = await supabase
        .from('one_on_one_feedbacks')
        .insert({
          student_id: user.id,
          mentor_id: selectedMentorId,
          status: 'pending',
          step1_content: content.trim(),
          step1_image_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('피드백 요청 생성에 실패했습니다.');
      }

      // 성공 시 상세 페이지로 이동
      router.push(`/feedback/${feedbackData.id}`);

    } catch (err) {
      console.error('제출 오류:', err);
      setError(err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 뒤로 가기 */}
        <Link 
          href="/feedback" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          피드백 목록으로
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">새 피드백 요청</h1>
        <p className="text-gray-500 mb-8">
          멘토에게 1:1 피드백을 요청하세요. 총 2회의 질문-답변이 가능합니다.
        </p>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 멘토 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              멘토 선택 *
            </label>
            <select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">멘토를 선택해주세요</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name} {mentor.is_verified && '✓'}
                </option>
              ))}
            </select>
            {mentors.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                현재 등록된 인증 멘토가 없습니다.
              </p>
            )}
          </div>

          {/* 작품 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작품 이미지 *
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="작품 미리보기"
                  className="max-w-full max-h-[400px] rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-1">클릭하여 이미지를 업로드하세요</p>
                <p className="text-sm text-gray-400">PNG, JPG (최대 10MB)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 질문 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 내용 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="멘토에게 피드백 받고 싶은 부분을 구체적으로 작성해주세요.&#10;&#10;예시:&#10;- 구도가 어색한 것 같은데 어떻게 수정하면 좋을까요?&#10;- 명암 처리가 제대로 됐는지 봐주세요.&#10;- 이 부분의 채색이 마음에 안 드는데 조언 부탁드려요."
              required
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Link
              href="/feedback"
              className="flex-1 px-4 py-3 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting || !selectedMentorId || !content.trim() || !imageFile}
              className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '요청 중...' : '피드백 요청하기'}
            </button>
          </div>
        </form>

        {/* 안내 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 1:1 피드백 진행 방식</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>학생이 작품 이미지와 질문을 보냅니다.</li>
            <li>멘토가 이미지에 직접 피드백을 그려서 답변합니다.</li>
            <li>학생이 추가 질문을 할 수 있습니다.</li>
            <li>멘토가 최종 답변을 하면 피드백이 완료됩니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

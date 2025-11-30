'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // 사용자 세션 및 역할 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (!user) {
          router.replace('/login');
          return;
        }

        const role = user.user_metadata?.role;

        if (role !== 'student') {
          alert('학생 계정만 작품을 업로드할 수 있습니다.');
          router.replace('/');
          return;
        }

        setUser(user);
        setUserRole(role);
      } catch (error) {
        console.error('User check error:', error);
        router.replace('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkUser();
  }, []);

  // 이미지 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 검증 (20MB 제한)
      if (file.size > 20 * 1024 * 1024) {
        alert('파일 크기는 20MB를 초과할 수 없습니다.');
        return;
      }

      setImageFile(file);

      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 업로드 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('작품 제목을 입력해주세요.');
      return;
    }

    if (!imageFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 현재 세션 다시 확인
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        alert('로그인이 필요합니다.');
        router.replace('/login');
        throw new Error('User not logged in');
      }

      // 1. 이미지 파일명 생성 (timestamp_originalFileName)
      const timestamp = Date.now();
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${timestamp}_${imageFile.name}`;

      // 2. Supabase Storage에 이미지 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        alert('이미지 업로드에 실패했습니다: ' + uploadError.message);
        throw uploadError;
      }

      // 3. 업로드된 이미지의 public URL 가져오기
      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 4. posts 테이블에 데이터 저장
      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          user_id: currentUser.id
        });

      if (dbError) {
        alert('작품 정보 저장에 실패했습니다: ' + dbError.message);
        throw dbError;
      }

      // 5. 성공 시 메인 페이지로 이동
      alert('작품이 성공적으로 업로드되었습니다!');
      router.push('/');
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded p-8 hover:shadow-sm transition-shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">작품 업로드</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                작품 제목 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="작품의 제목을 입력하세요"
                required
              />
            </div>

            {/* 설명 입력 */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                작품 설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="작품에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>

            {/* 이미지 파일 선택 */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-gray-900 mb-2">
                작품 이미지 *
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                JPG, PNG, GIF 등 이미지 파일 (최대 10MB)
              </p>
            </div>

            {/* 이미지 미리보기 */}
            {previewUrl && (
              <div>
                <p className="block text-sm font-semibold text-gray-900 mb-2">미리보기</p>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
              >
                {loading ? '업로드 중...' : '작품 업로드'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-200 rounded text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

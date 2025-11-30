'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'mentor';
  is_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // users 테이블에서 사용자 정보 가져오기
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('프로필 로드 에러:', error);
      } else if (data) {
        setUser(data);
        
        // 멘토인 경우 인증 상태 확인
        if (data.role === 'mentor' && !data.is_verified) {
          const { data: verificationData } = await supabase
            .from('mentor_verifications')
            .select('status')
            .eq('user_id', data.id)
            .single();
          
          if (verificationData) {
            setVerificationStatus(verificationData.status);
          }
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationFile(e.target.files[0]);
    }
  };

  const handleVerificationUpload = async () => {
    if (!verificationFile || !user) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploading(true);

    try {
      // 1. Storage에 파일 업로드
      const fileExt = verificationFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(filePath, verificationFile);

      if (uploadError) {
        console.error('업로드 에러:', uploadError);
        throw uploadError;
      }

      // 2. mentor_verifications 테이블에 기록
      const { error: insertError } = await supabase
        .from('mentor_verifications')
        .insert({
          user_id: user.id,
          file_url: filePath,
          status: 'pending'
        });

      if (insertError) {
        console.error('DB 저장 에러:', insertError);
        throw insertError;
      }

      alert('인증 서류가 제출되었습니다. 관리자 검토를 기다려주세요.');
      setVerificationStatus('pending');
      setVerificationFile(null);
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">프로필</h1>
      
      {/* 사용자 정보 표시 */}
      <div className="bg-white rounded border border-gray-200 p-6 mb-6 hover:shadow-sm transition-shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">이름</label>
          <p className="text-xl font-semibold text-gray-900">{user.name}</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">역할</label>
          <p className="text-lg text-gray-900">
            {user.role === 'student' ? '학생' : '멘토'}
            {user.is_verified && user.role === 'mentor' && (
              <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">
                인증된 멘토
              </span>
            )}
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">가입일</label>
          <p className="text-gray-900">
            {new Date(user.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* 멘토 인증 서류 업로드 UI */}
      {user.role === 'mentor' && !user.is_verified && (
        <div className="bg-white border border-gray-200 rounded p-6 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900">멘토 인증</h2>
          
          {verificationStatus === 'pending' ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-blue-800 font-semibold mb-2">✓ 인증 서류 제출 완료</p>
              <p className="text-sm text-blue-700">
                관리자 검토 중입니다. 승인까지 1-3일 정도 소요될 수 있습니다.
              </p>
            </div>
          ) : verificationStatus === 'rejected' ? (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-semibold mb-2">✗ 인증이 거부되었습니다</p>
              <p className="text-sm text-red-700 mb-4">
                서류를 다시 확인하고 재제출해주세요.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    증명 서류 (PDF, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {verificationFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      선택된 파일: {verificationFile.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleVerificationUpload}
                  disabled={uploading || !verificationFile}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '재제출'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                멘토 인증을 받으려면 다음 서류 중 하나를 업로드해주세요:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
                <li>미술 관련 학위증명서</li>
                <li>미술 강사 자격증</li>
                <li>미술 관련 경력 증명서</li>
                <li>기타 미술 전문성을 증명할 수 있는 서류</li>
              </ul>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    증명 서류 (PDF, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {verificationFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      선택된 파일: {verificationFile.name}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleVerificationUpload}
                  disabled={uploading || !verificationFile}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '제출하기'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


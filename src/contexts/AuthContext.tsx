'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'mentor';
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 프로필 조회
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, is_verified')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('프로필 조회 오류:', error);
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      console.error('프로필 조회 중 예외:', error);
      return null;
    }
  }, []);

  // 세션 초기화
  const initializeAuth = useCallback(async () => {
    try {
      // getUser()를 사용하여 현재 인증된 사용자 확인
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('사용자 조회 오류:', userError);
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // 세션도 함께 가져오기
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentUser && currentSession) {
        setUser(currentUser);
        setSession(currentSession);
        
        // 프로필 정보 조회
        const profile = await fetchUserProfile(currentUser.id);
        setUserProfile(profile);
      } else {
        setUser(null);
        setSession(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('인증 초기화 오류:', error);
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // 세션 새로고침
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('세션 갱신 오류:', error);
        return;
      }
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    } catch (error) {
      console.error('세션 갱신 중 예외:', error);
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }, []);

  // 인증 상태 변화 감지
  useEffect(() => {
    // 초기 인증 상태 확인
    initializeAuth();

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUserProfile(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            
            // 프로필 정보 조회
            const profile = await fetchUserProfile(newSession.user.id);
            setUserProfile(profile);
          }
        } else if (event === 'USER_UPDATED') {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
        }
      }
    );

    // 클린업
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  }
  return context;
}

// 1:1 피드백 관련 타입 정의

export type FeedbackStatus = 'pending' | 'replied_1' | 'questioned_2' | 'completed';

export interface OneOnOneFeedback {
  id: number;
  student_id: string;
  mentor_id: string;
  status: FeedbackStatus;
  step1_content: string;
  step1_image_url: string;
  step2_content: string | null;
  step2_image_url: string | null;
  step3_content: string | null;
  step4_content: string | null;
  step4_image_url: string | null;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  student?: {
    id: string;
    name: string;
    role: string;
  };
  mentor?: {
    id: string;
    name: string;
    role: string;
    is_verified: boolean;
  };
}

// 상태별 한글 라벨
export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '답변 대기 중',
  replied_1: '1차 답변 완료',
  questioned_2: '추가 질문 완료',
  completed: '피드백 완료',
};

// 상태별 색상
export const STATUS_COLORS: Record<FeedbackStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  replied_1: 'bg-blue-100 text-blue-800',
  questioned_2: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

// 현재 상태에서 누가 행동해야 하는지
export function getNextActor(status: FeedbackStatus): 'mentor' | 'student' | null {
  switch (status) {
    case 'pending':
      return 'mentor'; // 멘토가 1차 답변해야 함
    case 'replied_1':
      return 'student'; // 학생이 추가 질문해야 함
    case 'questioned_2':
      return 'mentor'; // 멘토가 최종 답변해야 함
    case 'completed':
      return null; // 종료됨
  }
}

// 현재 상태에서 다음 상태 결정
export function getNextStatus(currentStatus: FeedbackStatus): FeedbackStatus | null {
  switch (currentStatus) {
    case 'pending':
      return 'replied_1';
    case 'replied_1':
      return 'questioned_2';
    case 'questioned_2':
      return 'completed';
    case 'completed':
      return null;
  }
}

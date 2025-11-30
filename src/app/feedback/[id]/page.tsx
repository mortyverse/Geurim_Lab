import FeedbackDetailView from '@/components/FeedbackDetailView';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OneOnOneFeedbackPage({ params }: PageProps) {
  const { id } = await params;
  const feedbackId = parseInt(id, 10);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 뒤로 가기 버튼 */}
        <Link 
          href="/feedback" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          피드백 목록으로
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">1:1 피드백</h1>
        
        <FeedbackDetailView feedbackId={feedbackId} />
      </div>
    </div>
  );
}

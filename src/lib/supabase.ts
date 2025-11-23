import { createClient } from '@supabase/supabase-js';

// 1. .env.local 파일에서 환경 변수 불러옴
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. 환경 변수가 제대로 로드되었는지 확인 (없으면 에러 발생)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL 또는 anon key가 .env.local에 없습니다.");
}

// 3. Supabase 클라이언트를 생성하여 export함.
// 이를 통해 다른 파일에서 "import { supabase } from 'src/lib/supabase'" 형태로 사용할 수 있음
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 # Geurim Lab 🎨

 미술 입시생과 멘토를 위한 온라인 작품 피드백 커뮤니티 플랫폼

 ---

 ## 프로젝트 소개

 Geurim Lab은 미술 입시생들이 다양한 멘토(재학생, 강사 등)에게 온라인으로 작품 피드백을 받을 수 있는 커뮤니티 서비스입니다. 학생은 자신의 작품을 업로드하고, 멘토는 인증을 거쳐 피드백을 제공합니다. 최근에는 **1:1 피드백 기능**이 추가되어, 특정 멘토에게 직접 피드백을 요청하고 받을 수 있습니다.

 ---

 ## 주요 기능

 - **역할 기반 회원가입/로그인** (학생/멘토)
 - **작품 업로드** (이미지, 제목, 설명)
 - **작품 갤러리** (최신순, 상세 페이지)
 - **텍스트 피드백** (댓글 작성/목록 확인)
 - **개인 포트폴리오** (본인 작품만 모아보기)
 - **기본 프로필** (이름, 역할, 인증 멘토 배지)
 - **멘토 인증 시스템** (서류 업로드, 관리자 승인)
 - **1:1 피드백 요청/수락** (특정 멘토에게 직접 피드백 요청)

 ---

 ## 기술 스택

 - **Frontend:** Next.js 13+ (App Router)
 - **Backend:** Supabase (Auth, Postgres DB, Storage)
 - **UI:** Tailwind CSS
 - **State Management:** Zustand, Jotai (선택적)

 ---

 ## 설치 및 실행 방법

 ```bash
 npm install
 npm run dev
 ```

 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

 ---

 ## 배포

 [Vercel](https://vercel.com/)을 통해 손쉽게 배포할 수 있습니다. 환경 변수(.env.local) 설정 후, GitHub 레포를 Vercel에 연결하면 자동 배포됩니다.

 ---

 ## 폴더 구조

 ```
 src/
	 app/
		 ... (페이지별 라우팅)
	 components/
		 ... (UI 컴포넌트)
	 lib/
		 ... (Supabase 클라이언트)
	 types/
		 ... (타입 정의)
 docs/
	 PRD.md, TRD.md, DEVELOPMENT_PLAN.md, BACKLOG.md
 ```

 ---

 ## 참고 문서
 - [PRD.md] 제품 요구사항서
 - [TRD.md] 기술 요구사항서
 - [DEVELOPMENT_PLAN.md] 개발 계획표

 ---

 ## 라이선스

 MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

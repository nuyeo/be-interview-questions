# CS 면접 마스터 🔥

> 매일 한 문제, 백엔드 기술 면접 준비 — 게이미피케이션 기반 학습 웹앱

**[👉 지금 바로 사용하기](https://be-interview-questions.vercel.app/)**

<!-- 스크린샷 들어갈 자리 -->
<p align="center">
  <img src="https://github.com/user-attachments/assets/0b17d200-7e27-4e36-b1ef-7f1bef946dc1" height="650" />
  <img src="https://github.com/user-attachments/assets/9f604443-6cf5-4924-ae8e-feceaa3337c4" height="650" />
</p>

<!-- ![메인 화면](./screenshots/home.png) -->

## 💡 만든 이유

기술 면접 준비를 하면서 느낀 문제들이 있었습니다.

- GitHub 레포에서 매번 챕터를 찾아 열기까지 **액션이 너무 많아서** 귀찮다
- 깊이 있게 정리하려면 시간이 오래 걸려서 **매일 꾸준히 하기 어렵다**
- 내가 **뭘 모르는지조차 모르는** 상태에서 어디부터 공부할지 막막하다

Solved.ac나 듀오링고처럼 **스트릭과 게이미피케이션 요소**가 있으면 매일 짧게라도 이어갈 수 있겠다는 생각에, 직접 학습 도구를 만들었습니다.

## ✨ 주요 기능

### 🔥 스트릭 & 게이미피케이션
- 매일 학습 시 연속 일수(스트릭) 증가
- 오늘 학습 수, 전체 진행률 실시간 표시
- 카테고리별 달성률 프로그레스바

### ⚡ 원클릭 랜덤 문제
- 버튼 하나로 즉시 랜덤 문제 시작
- 이미 푼 문제보다 안 푼 문제 우선 출제
- 선택한 카테고리에서만 출제되도록 필터링

### 🤖 AI 피드백
- 답변 작성 후 AI가 점수/좋은 점/보완할 점/핵심 키워드 피드백
- 본인 API 키 등록 시 Anthropic Claude 또는 OpenAI GPT 사용 가능
- 미등록 시 기본 GPT-4o-mini 일 1회 제공

### 📝 학습 기록 저장
- 작성한 답변 + AI 피드백 + 학습 날짜 자동 저장 (Supabase DB)
- 완료한 문제에서 "내 답변 보기"로 이전 답변/피드백 확인
- "다시 학습하기"로 재도전 시 이전 답변이 미리 채워짐

### 🔖 북마크 & 복습
- 모르는 문제에 별표 → 북마크 모아보기에서 집중 복습
- 프로필 드롭다운에서 바로 접근 가능

### 📂 카테고리 커스터마이징
- 14개 카테고리 중 학습할 카테고리만 선택
- 선택하지 않은 카테고리는 홈에서 비활성화 표시
- 랜덤 문제 출제 범위에도 반영

### 👥 멀티 유저 지원
- GitHub 소셜 로그인
- 각 유저별 독립적인 학습 기록/북마크/설정
- 로그인 없이도 게스트 모드로 사용 가능 (localStorage 기반)

## 📋 문제 구성 (158문제)

| 카테고리 | 문제 수 | 난이도 분포 |
|---|---|---|
| Java/JVM | 32 | 기초 5 · 중급 22 · 심화 5 |
| Spring | 16 | 기초 1 · 중급 10 · 심화 5 |
| Database | 18 | 기초 1 · 중급 11 · 심화 6 |
| Network | 18 | 기초 4 · 중급 13 · 심화 1 |
| OS/Infra | 18 | 기초 3 · 중급 14 · 심화 1 |
| 자료구조/알고리즘 | 10 | 기초 4 · 중급 6 |
| 설계/아키텍처 | 5 | 중급 3 · 심화 2 |
| 디자인 패턴 | 8 | 중급 8 |
| 보안 | 7 | 기초 1 · 중급 6 |
| Web | 5 | 기초 1 · 중급 4 |
| JavaScript | 10 | 기초 1 · 중급 9 |
| Node.js | 3 | 기초 1 · 중급 2 |
| Python | 4 | 기초 2 · 중급 2 |
| Django/FastAPI | 4 | 기초 1 · 중급 3 |

> 질문 출처: [ksundong/backend-interview-question](https://github.com/ksundong/backend-interview-question), [매일메일](https://www.maeil-mail.kr/) 등을 참고하여 구성

## 🛠 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Serverless Functions) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GitHub OAuth) |
| AI | Anthropic Claude API / OpenAI API |
| Deploy | Vercel |

## 🏗 아키텍처

```
[Next.js on Vercel]
  ├── Supabase Auth ─── GitHub OAuth 소셜 로그인
  ├── Supabase DB ───── 학습 기록, 북마크 (PostgreSQL + RLS)
  └── API Route ─────── /api/feedback (AI 피드백 프록시)
                           ├── 사용자 Anthropic 키 → Claude
                           ├── 사용자 OpenAI 키 → GPT
                           └── 미등록 → 서버 기본 GPT-4o-mini
```

## 🚀 로컬 개발

### 사전 준비

- Node.js 18+
- [Supabase](https://supabase.com) 프로젝트 (무료)
- [Vercel](https://vercel.com) 계정 (배포 시)

### 설치 & 실행

```bash
# 클론
git clone https://github.com/nuyeo/be-interview-questions-vercel.git
cd be-interview-questions-vercel

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 값 입력

# 개발 서버 실행
npm run dev
```

### 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# AI (기본 제공용, 선택사항)
OPENAI_API_KEY=sk-...
```

### Supabase 설정

1. Supabase 프로젝트 생성 (Region: Seoul)
2. SQL Editor에서 `supabase-schema.sql` 실행
3. Authentication → Providers에서 GitHub OAuth 활성화
4. Settings → API에서 URL과 anon key 복사

## 📁 프로젝트 구조

```
├── app/
│   ├── api/feedback/
│   │   └── route.ts        # AI 피드백 API (서버사이드)
│   ├── globals.css          # 글로벌 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 페이지 (홈/목록/학습 뷰)
├── data/
│   └── questions.ts         # 158문제 데이터
├── lib/
│   ├── db.ts                # Supabase DB 헬퍼 함수
│   └── supabase.ts          # Supabase 클라이언트
├── supabase-schema.sql      # DB 스키마
└── .env.local               # 환경 변수 (git 제외)
```

## 🤝 기여

문제 추가, 버그 수정, 기능 제안 모두 환영합니다!

1. Fork → Branch → PR
2. 문제 추가 시 `data/questions.ts`에 적절한 카테고리/난이도로 추가

## 📄 라이선스

MIT License

질문 데이터는 [ksundong/backend-interview-question](https://github.com/ksundong/backend-interview-question) (CC BY-NC)과 [매일메일](https://www.maeil-mail.kr/)을 참고하여 재구성하였습니다.

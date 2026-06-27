---
description: Vesper 앱 및 백엔드 개발 환경 셋업을 시작하는 워크플로우
---

# Vesper 프로젝트 셋업 워크플로우

1. **Prerequisite 확인**
   로컬에 `Node.js`, `Deno`, `Supabase CLI`가 설치되어 있는지 확인합니다.
   // turbo
   `node -v && deno -V && supabase -v`

2. **Supabase 로컬 환경 초기화**
   Supabase 로컬 인스턴스를 기동하고 Edge Functions을 테스트할 준비를 합니다.
   // turbo
   `supabase start`

3. **React Native (Expo) 종속성 설치**
   프론트엔드 종속성을 설치합니다. `my-wonderful-app` (클라이언트) 폴더로 이동하여 패키지를 설치하세요.

4. **환경 변수 구성**
   `.env.local` 파일에 `EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_ANON_KEY`가 존재하는지 검증하세요.

5. **초기 컴파일 테스트**
   설정이 올바르게 되었는지 초기 빌드 테스트를 진행하세요.

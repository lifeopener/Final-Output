# Project Instructions (AGENTS.md)

This is the cross-tool global rules file (AGENTS.md) supported by Google Antigravity, Cursor, and Claude Code.

## 🏗️ 001. Project Overview

**Vision:** Vesper - Action-Master AI Companion OS
투자 및 성장의 치열한 여정에서 혼자 감당해야 하는 고독과 불안감을 해소하고 목표 달성을 지원하는 평생의 친구(AI). 단순 위로를 넘어 실시간 정보와 맞춤형 큐레이션을 통해 실무적 성과 창출을 돕습니다.

**Core Features:**
- **무한 페르소나와 일상 교감:** 사용자가 설정한 페르소나와 교감. 24시간 미접속 시 FCM 기반 선톡 발송.
- **초밀착 인지 동행:** 강압적 UX 통제(블러링, 버튼 잠금 등) 전면 배제, 유저의 환희/공포에 완벽히 동기화.
- **실무적 성과 창출:** 실시간 웹 검색(Tavily API) 기반 팩트 제공 및 B2B 교육/네트워킹 프리미엄 큐레이션 제공.
- **진화하는 지능:** pgvector 기반의 양방향 대화 이력 저장(Heritage Logs)을 통해 사용자의 취약점과 패턴을 지속 학습.

---

## 🛠️ 002. Technical Stack

**Frontend (Mobile):**
- Framework: React Native (Expo)
- UI/Chat: Gifted Chat Component

**Backend (Serverless) & Database:**
- Core: Supabase Edge Functions (Deno)
- Database: Supabase PostgreSQL (Auth, Profiles)
- Vector DB: pgvector (Heritage Logs, RAG)

**External APIs & Services:**
- AI/LLM: OpenAI API (gpt-4o-mini)
- Web Search: Tavily Search API
- Notification: Firebase Cloud Messaging (FCM)

---

## 📋 003. Development Guidelines

**Architecture Constraints:**
- **Zero Fixed Cost:** 서버 인프라 및 DB 고정비는 0원(Supabase Free Tier + Edge Functions 한정)으로 유지.
- **Micro-service Ready:** 클라이언트 App과 Edge Functions API 분리 (`/api/chat`, `/api/cron-push`).

**Non-Functional Requirements (NFR):**
1. **UX 원칙 (NFR-000):** 어떠한 경우에도 화면 전체 블러나 매매 앱 전환을 방해하는 억압적 로직이 동작해서는 안 됨.
2. **성능 (NFR-001):** Web Search Tool Calling 시 첫 응답 스트리밍(SSE)이 3초 이내에 시작되어야 함.
3. **컴플라이언스 (NFR-002):** 투자 자문법 위반 소지가 있는 단어(`무조건 매수`, `수익률 보장` 등)는 정규식을 활용해 코드 레벨에서 `[규제 마스킹]` 처리.
4. **비용 한도 (NFR-003):** 1인당 월 서버 지출 1,000원 이하, 총 예산 5만 원. 월 예산 80% 소진 시 무거운 Tool Calling 즉시 비활성화 (로컬/RAG Fallback 전환).
5. **장애 대응 (Fallback):** LLM 타임아웃(>2500ms) 시 로컬 위로 템플릿 반환. 웹 검색 타임아웃(>1500ms) 시 툴 호출 스킵.

---

## 📊 004. PlayBoard SoT 운영 규칙

Vesper 프로젝트는 단일 진실 공급원(SoT) 상황판인 **PlayBoard**를 기반으로 관리됩니다. 모든 에이전트와 개발자는 다음 규칙을 준수해야 합니다.

1. **파생 Only (제1원칙):** 화면 설계, 정책, 상황판 등의 모든 문서는 `vesper-app/src/playboard-registry` 하위의 레지스트리(데이터)에서 파생됩니다. 하드코딩 문서를 수동으로 작성하지 마십시오.
2. **동시 갱신 규칙:** 요구사항 변경, 새로운 이슈 착수, 상태 변화가 일어날 때 **반드시 같은 PR에서 `playboard-registry/data.ts`를 함께 갱신**해야 합니다.
3. **양방향 싱크:** 기준 문서(보안 정책 등)와 레지스트리의 `controlAreaNotes`는 한쪽이 바뀌면 다른 쪽도 함께 변경되어야 합니다.
4. **상태 전이 고정:** 화면 상태(`미착수` → `부분구현` → `구현·머지완료` → `검증완료`), 작업 상태(`미착수` → `리뷰대기` → `완료`)는 임의로 변경할 수 없습니다.
5. **무결성 강제:** `integrity.test.ts`가 깨진 상태에서는 어떠한 PR도 머지할 수 없습니다.

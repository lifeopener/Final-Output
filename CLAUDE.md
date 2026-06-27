# Project

이 문서는 Claude Code가 작업 시작 시 자동으로 로드하는 프로젝트 컨텍스트입니다.

---

## 1. Project Overview

### Vision
**Vesper - Action-Master AI Companion OS**
치열한 투자/성장 여정 속에서 고독과 불안감을 해소하고 목표 달성을 지원하는 평생의 친구(AI). 실시간 트렌드 검색과 프리미엄 자료 큐레이션을 통해 실무적 성장을 견인합니다.

### Core Features
- 무한 페르소나 및 일상 교감 (FCM 기반 옴니채널)
- 초밀착 인지 동행 (억압적 화면 통제 완전 배제, 심리적 동기화)
- 실무적 성과 창출 (웹 검색 Tool Calling 기반 실시간 뉴스 제공 및 B2B 자료 마크다운 큐레이션)
- 진화하는 지능 (pgvector 활용 RAG 기반 양방향 대화 이력 주입)

---

## 2. Tech Stack

### Frontend (Client App)
- **Framework:** React Native (Expo)
- **UI Component:** Gifted Chat Component

### Backend (Serverless) & Data Layer
- **API Core:** Supabase Edge Functions (Deno) (`/api/chat`, `/api/cron-push`)
- **Database:** Supabase PostgreSQL (Profiles, Auth)
- **Vector DB:** pgvector (Heritage Logs 저장 및 코사인 유사도 검색)

### External APIs
- **LLM:** OpenAI API (gpt-4o-mini 기반 비용 최적화)
- **Search:** Tavily Search API
- **Push:** Firebase Cloud Messaging (FCM)

---

## 3. Development Guidelines

### Development Priorities
1. **Zero 고정비 인프라:** Supabase Free Tier 환경 내에서 동작하도록 설계.
2. **억압적 UX 배제 (NFR-000):** 사용자의 행동을 물리적으로 통제(버튼 잠금, 전체 화면 블러)하는 로직 절대 금지.
3. **비용 및 예산 통제 (NFR-003):** 예산 80% 도달 시 Tool Calling 무효화.
4. **투자 규제 준수 (NFR-002):** 투자 자문을 암시하는 직접적인 문구 정규식 마스킹 처리 필수.
5. **Fallback 메커니즘:** API 지연 시 로컬/내부 지식망으로 우회하는 예외 처리 강제.

---

## 4. Subagent & Command Routing

작업 성격에 따라 적합한 서브에이전트 또는 슬래시 커맨드가 자동으로 위임됩니다.
수동 호출이 필요하면 `> use the <agent-name> subagent` 또는 `/<command>` 형태로 지시하세요.

### Subagents (`.claude/agents/`)
| 에이전트 | 사용 시점 |
|---|---|
| `react-native-expo` | React Native 모바일 앱 화면 개발, Gifted Chat 연동 시 |
| `supabase-deno` | Edge Functions API 구성, Deno 환경 백엔드 로직 작성 시 |
| `pgvector-rag` | Supabase pgvector 기반 유사도 검색 및 RAG 파이프라인 구축 시 |

### Slash Commands (`.claude/skills/`)
| 커맨드 | 목적 |
|---|---|
| `/fix-error` | 에러/예외 발생 시 구조화 진단·수정 (스킬 사용) |
| `/test-rag` | 코사인 유사도 검색 결과 단위 테스트 수행 시 |

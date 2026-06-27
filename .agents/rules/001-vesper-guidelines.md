---
description: Vesper 백엔드/프론트엔드 개발 시 핵심 가이드라인
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
# Vesper 개발 가이드라인

- **프론트엔드**: React Native (Expo)를 사용하며 UI는 Gifted Chat 컴포넌트 위주로 구현합니다.
- **백엔드**: Supabase Edge Functions (Deno) 환경에서 API를 작성합니다.
- **제한 사항**: 
  1. 사용자 화면을 억압하거나 버튼을 잠그는 로직을 절대 구현하지 마세요 (NFR-000).
  2. 챗봇 API 응답 스트리밍(SSE) 지연이 3초를 초과하지 않도록 설계하세요.
  3. LLM/Search API (OpenAI, Tavily) 호출 시 항상 Timeout Fallback 코드를 삽입하세요.
  4. 텍스트 출력 시 `/(무조건 매수|수익률 보장)/g`에 대해 마스킹 처리를 포함하세요.
- **데이터 저장소**: 관계형 데이터는 Supabase PostgreSQL에, 대화 이력(벡터)은 `pgvector` 기반으로 저장/조회합니다.

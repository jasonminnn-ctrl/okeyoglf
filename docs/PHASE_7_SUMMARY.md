# OkeyGolf OS — 공식 7단계 반영사항 요약

> 최종 갱신: 2026-03-11 (8-0 준비정리 시점)

---

## 1. 시장조사 요청 상태 정의

`ResearchRequestStatus` (src/lib/market-research.ts)

| 상태 | 레이블 | 의미 |
|---|---|---|
| `draft` | 임시 저장 | 사용자가 조건 입력 중, 아직 실행 안 함 |
| `requested` | 조사 요청 | 조사 실행 시작됨 |
| `processing_placeholder` | 처리 중 (준비 중) | 8단계 외부 수집 연동 전 placeholder |
| `completed` | 조사 완료 | AI 내부 분석 완료 (현재 단계) |
| `consultant_handoff` | 전담 컨설턴트 전환 | 조사 결과를 컨설턴트에 인계 |

---

## 2. 조사형 템플릿 구조

5개 기본 템플릿, 6개 업종별 예시 질문 분기:

| 템플릿 key | 제목 |
|---|---|
| `competitor` | 경쟁사 조사 |
| `area` | 지역/상권 조사 |
| `customer` | 고객/수요 조사 |
| `promotion` | 프로모션/상품 아이디어 조사 |
| `operation` | 운영 이슈 조사 |

업종: indoor(골프연습장), course, academy, shop, fitting, company

`getResearchTemplates(businessType)` → 업종별 예시 질문이 다르게 반환됨.

---

## 3. 저장된 결과 삭제 규칙

- **삭제 위치**: SavedPage 목록 (Trash2 아이콘), ResultDetailDrawer 상세
- **삭제 확인**: `DeleteConfirmDialog` — "삭제하시겠습니까?" / "되돌릴 수 없습니다."
- **삭제 범위**: ResultStore + localStorage에서 즉시 제거
- **적용 대상**: generation / research / consultant / manual — 타입 무관 동일 규칙
- **복구**: 현재 단계에서 복구 불가 (soft delete 전환은 서버 저장 시점에 대응)
- **삭제 후**: 목록, 카운트, 저장량 즉시 갱신

---

## 4. 저장공간 사용량 추정 구조

`calculateStorageMetrics(results)` → `StorageUsageMetrics`

| 필드 | 설명 |
|---|---|
| `totalSavedCount` | 전체 저장 건수 |
| `totalResearchCount` | 시장조사 결과 건수 |
| `totalGenerationCount` | 일반 생성 결과 건수 |
| `totalConsultantCount` | 컨설턴트 결과 건수 |
| `estimatedStorageBytes` | 추정 바이트 (plainText/sections + 200B 오버헤드) |
| `estimatedStorageLabel` | 사람 읽기용 (KB/MB) |

**멤버십별 soft quota placeholder:**

| 등급 | 최대 건수 |
|---|---|
| trial | 20 |
| standard | 100 |
| pro | 500 |
| enterprise | 무제한 (9999) |

> ⚠️ 현재 soft quota이며 강제 차단 미구현. 80% 이상 시 경고 표시만.

---

## 5. localStorage 기반 한계 & 향후 서버 저장 전환 포인트

### 현재 한계
- localStorage 용량 제한 (~5-10MB, 브라우저별 상이)
- 기기 간 동기화 불가
- 브라우저 초기화 시 데이터 소실
- 정확한 서버 사용량이 아닌 클라이언트 추정치

### 서버 전환 시 변경 포인트
1. `ResultStoreContext` — `loadFromStorage`/`saveToStorage`를 Supabase CRUD로 교체
2. `deleteResult` — soft delete (`deleted_at` 컬럼) 전환 가능
3. `calculateStorageMetrics` — 서버 쿼리 기반 정확한 수치로 교체
4. 저장 quota → 실제 enforcement (INSERT 차단 or 경고)
5. `okeygolf_research_requests` localStorage → DB 테이블 전환

---

## 6. 외부 수집 placeholder 구조 (8단계 준비)

`ResearchRequest` 내 필드:

| 필드 | 현재 값 | 8단계 이후 |
|---|---|---|
| `sourceType` | `"ai_internal"` | `"external_api"` / `"manual_collection"` |
| `collectionStatus` | `"completed"` | 실제 수집 상태 반영 |
| `sourceSummary` | AI 분석 기반 문구 | 외부 데이터 출처 요약 |
| `externalCollectionPlanned` | `false` | `true` 시 외부 수집 트리거 |

> 현재 실제 외부 호출 없음. 구조만 확보.

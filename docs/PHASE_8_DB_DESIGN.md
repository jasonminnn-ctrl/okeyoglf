# PHASE_8_DB_DESIGN

작성 기준: 2026-03-13

적용 단계: 아임웹 연동 1차 DB 설계 확정 단계

---

## 1. 문서 목적

이 문서는 OkeyGolf OS의 아임웹 연동 1차 DB 구조를 확정하기 위한 설계 문서다.

이 문서의 목적은 다음과 같다.

- 아임웹 연동을 단일 `profiles.imweb_member_id` 컬럼 추가 방식으로 처리하지 않도록 기준을 고정한다.
- 상품 → membershipCode 매핑, 포인트상품 → creditAmount 매핑, 주문 처리 이력, 회원 매칭, 사이트 연결 상태를 분리된 구조로 설계한다.
- 로그인 / 인증 연계보다 운영 매핑과 데이터 처리 구조를 먼저 확정한다.
- 이후 Supabase migration, repository, webhook 함수 구현의 기준 스키마를 고정한다.

---

## 2. 이번 문서의 결론

아임웹 1차 DB 구조는 아래 5개 테이블로 설계한다.

1. `imweb_site_connections`
2. `imweb_product_membership_mappings`
3. `imweb_point_credit_mappings`
4. `imweb_order_events`
5. `imweb_member_links`

추가 원칙은 다음과 같다.

- `profiles.imweb_member_id` 단독 추가 방식은 사용하지 않는다.
- 현재 Supabase Auth / profiles / user_roles / org_id / RLS 구조는 유지한 채 확장한다.
- 고객용 관리자 설정 5탭에는 이 구조를 직접 노출하지 않는다.
- 운영자 전용 `/operator` 내부 외부 연동 탭에서만 관리한다.
- 로그인 / 인증 연계는 후순위로 유지한다.

---

## 3. 테이블별 설계

## 3-1. `imweb_site_connections`

### 목적

아임웹 사이트 연결 상태를 관리하는 기준 테이블이다.

사이트 연결, `siteCode`, 연동 상태, 최근 동기화 상태, 최근 오류 상태를 기록한다.

### 최소 컬럼

- `id`
  - UUID
  - PK

- `org_id`
  - UUID
  - `organizations.id` FK
  - NOT NULL

- `external_provider`
  - TEXT
  - 기본값 `imweb`

- `site_code`
  - TEXT
  - NOT NULL

- `connection_status`
  - TEXT
  - 예: `pending`, `connected`, `disconnected`, `testing`, `error`

- `webhook_url`
  - TEXT
  - NULL 허용

- `webhook_registered`
  - BOOLEAN
  - 기본값 `false`

- `last_synced_at`
  - TIMESTAMPTZ
  - NULL 허용

- `last_event_at`
  - TIMESTAMPTZ
  - NULL 허용

- `last_event_type`
  - TEXT
  - NULL 허용

- `last_error`
  - TEXT
  - NULL 허용

- `note`
  - TEXT
  - NULL 허용

- `created_at`
  - TIMESTAMPTZ

- `updated_at`
  - TIMESTAMPTZ

### 제약 / 인덱스

- `UNIQUE(org_id, site_code)`
- `INDEX(org_id)`
- `INDEX(connection_status)`

### 비고

- 1조직 1사이트만 강제하지 않는다.
- 향후 멀티브랜치 / 다사이트 연결 확장 가능성을 남긴다.
- 실제 토큰 저장 구조가 필요해지면 별도 비밀정보 저장 레이어로 분리한다.

---

## 3-2. `imweb_product_membership_mappings`

### 목적

아임웹 상품코드와 내부 `membership_code`를 연결하는 운영자 전용 매핑 테이블이다.

### 최소 컬럼

- `id`
  - UUID
  - PK

- `org_id`
  - UUID
  - `organizations.id` FK
  - NOT NULL

- `site_connection_id`
  - UUID
  - `imweb_site_connections.id` FK
  - NOT NULL

- `external_product_code`
  - TEXT
  - NOT NULL

- `external_product_name`
  - TEXT
  - NOT NULL

- `mapped_membership_code`
  - `membership_code`
  - NOT NULL

- `mapped_membership_label`
  - TEXT
  - NULL 허용

- `is_active`
  - BOOLEAN
  - 기본값 `true`

- `note`
  - TEXT
  - NULL 허용

- `created_by`
  - TEXT
  - NULL 허용

- `created_at`
  - TIMESTAMPTZ

- `updated_at`
  - TIMESTAMPTZ

### 제약 / 인덱스

- `UNIQUE(org_id, site_connection_id, external_product_code)`
- `INDEX(org_id)`
- `INDEX(mapped_membership_code)`
- `INDEX(is_active)`

### 비고

- 기존 시스템의 `membership_code` enum 값을 그대로 사용한다.
- 고객용 화면에는 직접 노출하지 않는다.

---

## 3-3. `imweb_point_credit_mappings`

### 목적

아임웹 포인트상품 / 충전상품과 내부 `creditAmount` 반영 규칙을 연결하는 운영자 전용 매핑 테이블이다.

### 최소 컬럼

- `id`
  - UUID
  - PK

- `org_id`
  - UUID
  - `organizations.id` FK
  - NOT NULL

- `site_connection_id`
  - UUID
  - `imweb_site_connections.id` FK
  - NOT NULL

- `external_point_product_code`
  - TEXT
  - NOT NULL

- `external_point_product_name`
  - TEXT
  - NOT NULL

- `mapped_credit_amount`
  - INTEGER
  - NOT NULL

- `grant_mode`
  - TEXT
  - 예: `auto`, `manual_review`, `manual_only`

- `is_active`
  - BOOLEAN
  - 기본값 `true`

- `note`
  - TEXT
  - NULL 허용

- `created_by`
  - TEXT
  - NULL 허용

- `created_at`
  - TIMESTAMPTZ

- `updated_at`
  - TIMESTAMPTZ

### 제약 / 인덱스

- `UNIQUE(org_id, site_connection_id, external_point_product_code)`
- `CHECK(mapped_credit_amount > 0)`
- `INDEX(org_id)`
- `INDEX(grant_mode)`
- `INDEX(is_active)`

### 비고

- 자동 지급은 후속 단계다.
- 1차에서는 지급 규칙 저장과 운영자 검토 기준 고정이 목적이다.

---

## 3-4. `imweb_order_events`

### 목적

아임웹 웹훅 / 주문 이벤트 원본 payload와 처리 상태를 저장하는 이벤트 로그 테이블이다.

이 테이블은 동기화 이력과 예외 처리의 기준 테이블 역할을 겸한다.

### 최소 컬럼

- `id`
  - UUID
  - PK

- `org_id`
  - UUID
  - `organizations.id` FK
  - NOT NULL

- `site_connection_id`
  - UUID
  - `imweb_site_connections.id` FK
  - NOT NULL

- `external_provider`
  - TEXT
  - 기본값 `imweb`

- `event_type`
  - TEXT
  - NOT NULL

- `external_order_id`
  - TEXT
  - NULL 허용

- `external_member_id`
  - TEXT
  - NULL 허용

- `external_product_code`
  - TEXT
  - NULL 허용

- `external_product_name`
  - TEXT
  - NULL 허용

- `paid_amount`
  - NUMERIC(12,2)
  - NULL 허용

- `currency_code`
  - TEXT
  - 기본값 `KRW`

- `ordered_at`
  - TIMESTAMPTZ
  - NULL 허용

- `order_status`
  - TEXT
  - NULL 허용

- `processing_status`
  - TEXT
  - 예: `received`, `mapped`, `manual_review`, `applied`, `failed`, `ignored`

- `processing_error`
  - TEXT
  - NULL 허용

- `processed_at`
  - TIMESTAMPTZ
  - NULL 허용

- `processed_by`
  - TEXT
  - NULL 허용

- `retry_count`
  - INTEGER
  - 기본값 `0`

- `idempotency_key`
  - TEXT
  - NULL 허용

- `payload`
  - JSONB
  - NOT NULL

- `created_at`
  - TIMESTAMPTZ

- `updated_at`
  - TIMESTAMPTZ

### 제약 / 인덱스

- `INDEX(org_id)`
- `INDEX(site_connection_id)`
- `INDEX(event_type)`
- `INDEX(external_order_id)`
- `INDEX(processing_status)`
- `UNIQUE(idempotency_key)` 권장

### 비고

- 1차에서는 주문 / 주문섹션 / 주문섹션아이템 상세 정규화 테이블을 만들지 않는다.
- 공식 주문 구조가 3 depth이므로, 1차는 `payload` 보존 중심으로 가고 정규화는 후속 단계로 둔다.
- 환불 / 취소 / 중복 주문도 이 테이블의 `processing_status`, `processing_error`, `payload`로 우선 추적한다.

---

## 3-5. `imweb_member_links`

### 목적

아임웹 회원과 OkeyGolf 내부 계정의 연결 상태를 관리하는 회원 링크 테이블이다.

### 최소 컬럼

- `id`
  - UUID
  - PK

- `org_id`
  - UUID
  - `organizations.id` FK
  - NOT NULL

- `site_connection_id`
  - UUID
  - `imweb_site_connections.id` FK
  - NOT NULL

- `external_provider`
  - TEXT
  - 기본값 `imweb`

- `external_member_id`
  - TEXT
  - NOT NULL

- `member_name`
  - TEXT
  - NULL 허용

- `email`
  - TEXT
  - NULL 허용

- `phone`
  - TEXT
  - NULL 허용

- `linked_profile_id`
  - UUID
  - `profiles.id` FK
  - NULL 허용

- `link_status`
  - TEXT
  - 예: `linked`, `unlinked`, `needs_review`, `sync_failed`

- `sync_status`
  - TEXT
  - 예: `pending`, `synced`, `failed`

- `first_linked_at`
  - TIMESTAMPTZ
  - NULL 허용

- `last_synced_at`
  - TIMESTAMPTZ
  - NULL 허용

- `note`
  - TEXT
  - NULL 허용

- `created_at`
  - TIMESTAMPTZ

- `updated_at`
  - TIMESTAMPTZ

### 제약 / 인덱스

- `UNIQUE(org_id, external_provider, external_member_id)`
- `INDEX(org_id)`
- `INDEX(linked_profile_id)`
- `INDEX(link_status)`
- `INDEX(sync_status)`

### 비고

- 1차에서는 `profiles.imweb_member_id` 캐시 컬럼을 만들지 않는다.
- 회원 연결은 운영자 확인이 개입될 수 있는 구조를 유지한다.

---

## 4. 1차에서 하지 않는 것

이번 문서 기준 1차 범위에서 아래 항목은 구현 대상으로 확정하지 않는다.

- `profiles.imweb_member_id` 단일 컬럼 추가
- 아임웹 완전 SSO / 로그인 일체화
- 토큰 저장 세부 스키마 확정
- 주문섹션 / 주문섹션아이템 정규화 테이블
- 자동 멤버십 반영 비즈니스 로직
- 자동 크레딧 지급 비즈니스 로직
- 환불 역정산 자동 처리
- 고객용 UI 직접 노출

---

## 5. 운영자 화면 연결 기준

운영자 전용 `/operator` 외부 연동 탭은 아래 구조로 읽힌다.

- `imweb_site_connections`
  - 아임웹 회원/주문 연동 상태

- `imweb_product_membership_mappings`
  - 상품 → 멤버십 매핑

- `imweb_point_credit_mappings`
  - 포인트상품 → 크레딧 매핑

- `imweb_order_events`
  - 동기화 이력 / 예외 처리 / 재처리 기준

- `imweb_member_links`
  - 회원 매칭 / 운영자 확인 흐름

고객용 관리자 설정 5탭에는 위 구조를 직접 노출하지 않는다.

---

## 6. migration 작성 원칙

이 문서가 확정되면 다음 migration은 아래 원칙으로 작성한다.

- 모든 테이블은 `org_id` 기준으로 묶는다.
- 기존 `membership_code` enum은 재사용한다.
- 상태값은 1차에서는 TEXT로 두고, 실제 이벤트 분포 확인 후 enum 고도화를 검토한다.
- 모든 테이블에 `created_at`, `updated_at`를 둔다.
- 운영 이력 추적이 필요한 테이블은 원본 payload 또는 note를 남길 수 있게 한다.
- RLS는 기존 `org_id` 스코프 구조와 충돌 없이 추가한다.
- 고객용 CRUD가 아니라 운영자 / 서버사이드 처리 중심 구조로 시작한다.

---

## 7. 확인 필요 항목

아래 항목은 API 스펙 확인 후 migration 전에 최종 확정한다.

- 웹훅에서 사용하는 고유 member identifier의 안정성
- 주문 환불 / 취소 / 부분취소 이벤트 수신 범위
- `ORDER_*` 이벤트별 payload 공통 필드
- 한 조직이 여러 `siteCode`를 연결할 필요가 있는지
- 아임웹 연동 완료 처리 이후 사용 가능한 Scope 범위
- 로그인 / 인증 연계가 실제로 가능한지 여부

---

## 8. 다음 단계

이 문서 확정 후 다음 순서로 진행한다.

1. `supabase/migrations/*_imweb_phase1_schema.sql` 작성
2. `src/lib/repositories/imweb-repository.ts` 작성
3. `supabase/functions/imweb-webhook/index.ts` 작성
4. 운영자 외부 연동 탭을 실제 DB 조회 구조로 전환
5. 이후 로그인 / 인증 연계 검토

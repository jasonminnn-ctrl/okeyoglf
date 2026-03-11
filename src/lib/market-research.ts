/**
 * Market Research Structures (Phase 7)
 * 
 * Research request types, industry-specific templates,
 * and external collection placeholders.
 */

import type { BusinessType } from "@/contexts/BusinessContext";

// ──────────────────────────────────
// Research Request Status
// ──────────────────────────────────

export type ResearchRequestStatus =
  | "draft"
  | "requested"
  | "processing_placeholder"
  | "completed"
  | "consultant_handoff";

export const researchStatusLabels: Record<ResearchRequestStatus, string> = {
  draft: "임시 저장",
  requested: "조사 요청",
  processing_placeholder: "처리 중 (준비 중)",
  completed: "조사 완료",
  consultant_handoff: "전담 컨설턴트 전환",
};

export const researchStatusColors: Record<ResearchRequestStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  requested: "bg-amber-500/20 text-amber-400",
  processing_placeholder: "bg-blue-500/20 text-blue-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  consultant_handoff: "bg-purple-500/20 text-purple-400",
};

// ──────────────────────────────────
// Research Request
// ──────────────────────────────────

export interface ResearchRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ResearchRequestStatus;
  businessType: BusinessType;
  businessTypeLabel: string;
  region: string;
  keyword: string;
  purpose: string;
  scope: string; // template key
  count: string;
  memo: string;
  /** linked SavedResult id after completion */
  linkedResultId?: string;
  /** External collection placeholders (Phase 8+) */
  sourceType?: "ai_internal" | "external_api" | "manual_collection";
  collectionStatus?: "not_started" | "in_progress" | "completed" | "failed";
  sourceSummary?: string;
  externalCollectionPlanned?: boolean;
}

// ──────────────────────────────────
// Research Templates (industry-aware)
// ──────────────────────────────────

export interface ResearchTemplate {
  key: string;
  title: string;
  description: string;
  exampleQuestion: string;
}

const baseTemplates: Record<string, Omit<ResearchTemplate, "exampleQuestion">> = {
  competitor: { key: "competitor", title: "경쟁사 조사", description: "주변 경쟁 업체 현황, 가격, 서비스를 비교 분석합니다" },
  area: { key: "area", title: "지역/상권 조사", description: "입지, 유동인구, 상권 특성을 파악합니다" },
  customer: { key: "customer", title: "고객/수요 조사", description: "고객 유형, 수요 패턴, 니즈를 분석합니다" },
  promotion: { key: "promotion", title: "프로모션/상품 아이디어 조사", description: "경쟁사 프로모션, 신상품 트렌드를 조사합니다" },
  operation: { key: "operation", title: "운영 이슈 조사", description: "업종 공통 운영 문제, 규제, 인력 이슈를 조사합니다" },
};

const templateExamplesByIndustry: Record<BusinessType, Record<string, string>> = {
  indoor: {
    competitor: "반경 5km 내 골프연습장 가격대/레슨 프로그램 비교",
    area: "연습장 주변 유동인구·주거 밀집도 분석",
    customer: "회원 연령대별 이용 시간대/레슨 수요 분석",
    promotion: "주중 할인·레슨 체험권·신규 회원 이벤트 조사",
    operation: "타석 관리 자동화·레슨 프로 수급 현황 조사",
  },
  course: {
    competitor: "인근 골프장 그린피·패키지·부대시설 비교",
    area: "골프장 접근성·숙박 연계 상권 분석",
    customer: "법인팀·개인 라운드 비중 및 객단가 분석",
    promotion: "시즌 패키지·얼리버드·멤버십 프로모션 조사",
    operation: "캐디 수급·코스 관리·우천 대응 현황 조사",
  },
  academy: {
    competitor: "인근 골프아카데미 수업료·커리큘럼·강사진 비교",
    area: "아카데미 주변 학원가·주거 밀집도 분석",
    customer: "수강생 연령대별 수요·체험레슨 전환율 분석",
    promotion: "방학 특강·체험레슨·그룹 할인 조사",
    operation: "강사 수급·수업 운영 시간대·시설 관리 조사",
  },
  shop: {
    competitor: "인근 골프샵 브랜드·가격대·서비스 비교",
    area: "매장 주변 상권·경쟁 채널(온라인) 분석",
    customer: "구매 고객 유형·객단가·재구매율 분석",
    promotion: "시즌 세일·신상품 출시·리뷰 이벤트 조사",
    operation: "재고 관리·브랜드 발주·A/S 정책 조사",
  },
  fitting: {
    competitor: "인근 피팅샵 브랜드·장비·서비스 비교",
    area: "피팅샵 주변 골프 관련 시설 밀집도 분석",
    customer: "피팅 고객 유형·재피팅율·구매 전환 분석",
    promotion: "피팅 체험·브랜드 비교 이벤트 조사",
    operation: "피팅 장비 유지보수·예약 관리 현황 조사",
  },
  company: {
    competitor: "경쟁사 유통 채널·파트너·가격 정책 비교",
    area: "B2B 거래처 분포·시장 규모 분석",
    customer: "거래처 유형·계약 규모·리드 전환율 분석",
    promotion: "B2B 프로모션·전시회·세미나 전략 조사",
    operation: "유통 물류·품질 관리·규제 현황 조사",
  },
};

export function getResearchTemplates(businessType: BusinessType): ResearchTemplate[] {
  const examples = templateExamplesByIndustry[businessType] || templateExamplesByIndustry.indoor;
  return Object.entries(baseTemplates).map(([key, tmpl]) => ({
    ...tmpl,
    exampleQuestion: examples[key] || "",
  }));
}

// ──────────────────────────────────
// Storage Usage Metrics (Phase 7)
// ──────────────────────────────────

export interface StorageUsageMetrics {
  totalSavedCount: number;
  totalResearchCount: number;
  totalGenerationCount: number;
  totalConsultantCount: number;
  estimatedStorageBytes: number;
  estimatedStorageLabel: string;
}

export function calculateStorageMetrics(results: { type: string; plainText?: string; sections?: { content: string }[] }[]): StorageUsageMetrics {
  const totalSavedCount = results.length;
  const totalResearchCount = results.filter(r => r.type === "research").length;
  const totalConsultantCount = results.filter(r => r.type === "consultant").length;
  const totalGenerationCount = results.filter(r => r.type === "generation").length;

  // Estimate bytes from plainText or sections content
  let estimatedBytes = 0;
  for (const r of results) {
    if (r.plainText) {
      estimatedBytes += new Blob([r.plainText]).size;
    } else if (r.sections) {
      for (const s of r.sections) {
        estimatedBytes += new Blob([s.content]).size;
      }
    }
    // Add ~200 bytes overhead per result for metadata
    estimatedBytes += 200;
  }

  let estimatedStorageLabel: string;
  if (estimatedBytes < 1024) {
    estimatedStorageLabel = `${estimatedBytes} B`;
  } else if (estimatedBytes < 1024 * 1024) {
    estimatedStorageLabel = `${(estimatedBytes / 1024).toFixed(1)} KB`;
  } else {
    estimatedStorageLabel = `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    totalSavedCount,
    totalResearchCount,
    totalGenerationCount,
    totalConsultantCount,
    estimatedStorageBytes: estimatedBytes,
    estimatedStorageLabel,
  };
}

// ──────────────────────────────────
// Storage Quota Placeholders (Phase 7)
// ──────────────────────────────────

export interface StorageQuotaPlaceholder {
  membershipCode: string;
  maxResults: number; // soft limit, not enforced yet
  label: string;
}

export const storageQuotaPlaceholders: StorageQuotaPlaceholder[] = [
  { membershipCode: "trial", maxResults: 20, label: "최대 20건 (체험판)" },
  { membershipCode: "standard", maxResults: 100, label: "최대 100건 (스탠다드)" },
  { membershipCode: "pro", maxResults: 500, label: "최대 500건 (프로)" },
  { membershipCode: "enterprise", maxResults: 9999, label: "무제한 (엔터프라이즈)" },
];

export function getStorageQuota(membershipCode: string): StorageQuotaPlaceholder {
  return storageQuotaPlaceholders.find(q => q.membershipCode === membershipCode) || storageQuotaPlaceholders[0];
}

/**
 * OkeyGolf AI Generation Pipeline
 * 
 * Shared architecture for AI generation across all modules.
 * Currently uses mock generation; designed for future real AI provider integration.
 * 
 * Pipeline Steps:
 * 1. Load customer business context
 * 2. Load module prompt definition
 * 3. Load business-type instruction
 * 4. Apply output rules
 * 5. Apply forbidden rules
 * 6. Apply AI reference allowance rules
 * 7. Attach allowed knowledge/context
 * 8. Route through ROS engine mapping
 * 9. Generate result
 * 10. Show result in save-ready structure
 * 11. Allow consultant escalation
 */

import type { BusinessType, BusinessTypeConfig } from "@/contexts/BusinessContext";

// ──────────────────────────────────
// Types
// ──────────────────────────────────

export interface GenerationContext {
  businessType: BusinessType;
  businessLabel: string;
  module: string;
  subtool: string;
  userInputs: Record<string, string>;
  contextSummary: BusinessContextSummary;
}

export interface BusinessContextSummary {
  organizationName: string;
  businessType: string;
  location: string;
  operatingHours: string;
  keyMetrics: string[];
  internalNotes: string[];
}

export interface GenerationResult {
  id: string;
  title: string;
  module: string;
  subtool: string;
  businessType: string;
  contextSummary: BusinessContextSummary;
  sections: GenerationResultSection[];
  createdAt: string;
  status: "생성 완료" | "임시 저장" | "검토 필요";
  sourceNote?: string;
  referenceNote?: string;
}

export interface GenerationResultSection {
  title: string;
  content: string;
  type: "summary" | "detail" | "action" | "checklist" | "risk" | "recommendation";
}

// ──────────────────────────────────
// Pipeline Configuration
// ──────────────────────────────────

export interface PipelineConfig {
  module: string;
  subtool: string;
  outputStyle: "structured" | "narrative" | "checklist" | "table";
  maxSections: number;
  allowConsultantEscalation: boolean;
  saveCategory: string;
}

export const pipelineConfigs: Record<string, PipelineConfig> = {
  // AI 비서
  "ai-assistant/daily-tasks": {
    module: "AI 비서", subtool: "오늘의 할 일",
    outputStyle: "checklist", maxSections: 3,
    allowConsultantEscalation: false, saveCategory: "AI 비서 결과",
  },
  "ai-assistant/weekly-actions": {
    module: "AI 비서", subtool: "이번 주 추천 액션",
    outputStyle: "structured", maxSections: 4,
    allowConsultantEscalation: false, saveCategory: "AI 비서 결과",
  },
  "ai-assistant/checklist": {
    module: "AI 비서", subtool: "업종별 체크리스트",
    outputStyle: "checklist", maxSections: 3,
    allowConsultantEscalation: false, saveCategory: "AI 비서 결과",
  },
  "ai-assistant/ops-check": {
    module: "AI 비서", subtool: "놓치고 있는 운영 항목",
    outputStyle: "structured", maxSections: 4,
    allowConsultantEscalation: false, saveCategory: "운영 점검 결과",
  },
  "ai-assistant/campaign-planner": {
    module: "AI 비서", subtool: "캠페인 추천",
    outputStyle: "structured", maxSections: 4,
    allowConsultantEscalation: false, saveCategory: "캠페인 결과",
  },
  "ai-assistant/reminder-board": {
    module: "AI 비서", subtool: "일정/마감 리마인드",
    outputStyle: "structured", maxSections: 3,
    allowConsultantEscalation: false, saveCategory: "리마인드 결과",
  },
  // AI 운영팀
  "ai-operations/diagnosis": {
    module: "AI 운영팀", subtool: "AI 진단실",
    outputStyle: "structured", maxSections: 7,
    allowConsultantEscalation: true, saveCategory: "AI 운영팀 결과",
  },
  // AI 영업팀
  "ai-sales/response-script": {
    module: "AI 영업팀", subtool: "응대 문안",
    outputStyle: "narrative", maxSections: 4,
    allowConsultantEscalation: true, saveCategory: "AI 영업팀 결과",
  },
  "ai-sales/re-registration": {
    module: "AI 영업팀", subtool: "재등록 관리",
    outputStyle: "structured", maxSections: 5,
    allowConsultantEscalation: true, saveCategory: "AI 영업팀 결과",
  },
  // AI 마케팅팀
  "ai-marketing/copy": {
    module: "AI 마케팅팀", subtool: "마케팅 카피 생성기",
    outputStyle: "narrative", maxSections: 5,
    allowConsultantEscalation: true, saveCategory: "AI 마케팅팀 결과",
  },
  "ai-marketing/promotion": {
    module: "AI 마케팅팀", subtool: "프로모션 기획",
    outputStyle: "structured", maxSections: 5,
    allowConsultantEscalation: true, saveCategory: "AI 마케팅팀 결과",
  },
  // AI 디자인팀
  "ai-design/request": {
    module: "AI 디자인팀", subtool: "디자인 요청",
    outputStyle: "structured", maxSections: 4,
    allowConsultantEscalation: true, saveCategory: "AI 디자인팀 결과",
  },
  "ai-design/copy-layout": {
    module: "AI 디자인팀", subtool: "홍보물 문안 + 레이아웃",
    outputStyle: "structured", maxSections: 4,
    allowConsultantEscalation: true, saveCategory: "AI 디자인팀 결과",
  },
  // AI 경영지원
  "ai-support/document-draft": {
    module: "AI 경영지원", subtool: "내부 서식 초안",
    outputStyle: "narrative", maxSections: 3,
    allowConsultantEscalation: true, saveCategory: "AI 경영지원 결과",
  },
  "ai-support/contract-order": {
    module: "AI 경영지원", subtool: "계약/발주/구매 정리",
    outputStyle: "structured", maxSections: 4,
    allowConsultantEscalation: true, saveCategory: "AI 경영지원 결과",
  },
  // 시장조사
  "market-research/summary": {
    module: "시장조사", subtool: "조사 요약",
    outputStyle: "structured", maxSections: 6,
    allowConsultantEscalation: true, saveCategory: "시장조사 결과",
  },
};

// ──────────────────────────────────
// Context Builder
// ──────────────────────────────────

export function buildContextSummary(
  businessType: BusinessType,
  businessLabel: string,
  orgProfile?: import("@/contexts/BusinessContext").OrgProfile,
): BusinessContextSummary {
  const contextDefaults: Record<BusinessType, Partial<BusinessContextSummary>> = {
    indoor: { organizationName: "OkeyGolf 연습장", location: "경기도 용인시", operatingHours: "06:00 ~ 24:00", keyMetrics: ["타석 60개", "회원 300명", "레슨 프로 5명"], internalNotes: ["주중 오전 할인 안내 필수", "VIP 회원 별도 관리"] },
    course: { organizationName: "OkeyGolf CC", location: "강원도 원주시", operatingHours: "06:00 ~ 18:00", keyMetrics: ["18홀", "일 42팀", "잔여 타임 18건"], internalNotes: ["OTA 수수료 관리", "시즌 패키지 운영"] },
    academy: { organizationName: "OkeyGolf 아카데미", location: "서울 강남구", operatingHours: "10:00 ~ 21:00", keyMetrics: ["수강생 45명", "코치 3명", "체험전환율 28%"], internalNotes: ["체험레슨 전환 관리", "정규반 재등록 안내"] },
    shop: { organizationName: "OkeyGolf 샵", location: "서울 종로구", operatingHours: "10:00 ~ 20:00", keyMetrics: ["문의 85건/월", "전환율 12%", "객단가 35만"], internalNotes: ["시즌 상품 진열", "리뷰 수집 강화"] },
    fitting: { organizationName: "OkeyGolf 피팅센터", location: "서울 강남구", operatingHours: "10:00 ~ 19:00", keyMetrics: ["월 28건 예약", "완료율 85%", "전환율 62%"], internalNotes: ["노쇼 방지", "후속 제안 관리"] },
    company: { organizationName: "OkeyGolf 컴퍼니", location: "서울 강남구", operatingHours: "09:00 ~ 18:00", keyMetrics: ["리드 156건", "전환율 18%", "거래처 32개"], internalNotes: ["B2B 제안서 관리", "파트너 정산"] },
  };

  const defaults = contextDefaults[businessType] || {};

  // Org profile values take priority over hardcoded defaults
  const orgName = orgProfile?.companyName || orgProfile?.brandName || defaults.organizationName || "OkeyGolf";
  const location = orgProfile?.address || defaults.location || "";
  const hours = orgProfile?.operatingHours || defaults.operatingHours || "";

  // Build internal notes from org profile + defaults
  const notes: string[] = [...(defaults.internalNotes || [])];
  if (orgProfile?.internalNotes) {
    notes.unshift(...orgProfile.internalNotes.split("\n").filter(Boolean));
  }
  if (orgProfile?.internalTerms) {
    notes.unshift(`용어: ${orgProfile.internalTerms}`);
  }

  // Build key metrics from operation fields if available
  const metrics = defaults.keyMetrics || [];
  if (orgProfile?.operationFields) {
    const fieldValues = Object.entries(orgProfile.operationFields)
      .filter(([_, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`);
    if (fieldValues.length > 0) {
      return {
        organizationName: orgName,
        businessType: businessLabel,
        location,
        operatingHours: hours,
        keyMetrics: fieldValues.length > 0 ? fieldValues : metrics,
        internalNotes: notes,
      };
    }
  }

  return {
    organizationName: orgName,
    businessType: businessLabel,
    location,
    operatingHours: hours,
    keyMetrics: metrics,
    internalNotes: notes,
  };
}

// ──────────────────────────────────
// Mock Generation Engine
// ──────────────────────────────────

export function generateMockResult(
  context: GenerationContext,
  config: PipelineConfig,
): Promise<GenerationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sections = getMockSections(config.module, config.subtool, context);
      resolve({
        id: `result-${Date.now()}`,
        title: `${config.subtool} — ${context.businessLabel}`,
        module: config.module,
        subtool: config.subtool,
        businessType: context.businessLabel,
        contextSummary: context.contextSummary,
        sections,
        createdAt: new Date().toISOString(),
        status: "생성 완료",
        sourceNote: "OkeyGolf AI 엔진 기반 생성 (내부 정책 적용)",
        referenceNote: "고객 운영 프로필 + 업종별 지침 참조",
      });
    }, 1500 + Math.random() * 1000);
  });
}

function getMockSections(
  module: string,
  subtool: string,
  context: GenerationContext,
): GenerationResultSection[] {
  const biz = context.businessLabel;
  
  const sectionLibrary: Record<string, GenerationResultSection[]> = {
    "오늘의 할 일": [
      { title: "📋 오늘의 할 일 요약", type: "summary", content: `${biz} 업종 기준으로 오늘 우선 처리해야 할 항목을 정리했습니다.\n\n1. 미방문 고객 접촉 (우선순위 높음)\n   - 30일 이상 미방문 고객 중 가치 높은 상위 10명 선정\n   - 개인별 맞춤 메시지 발송\n\n2. 운영 현황 점검\n   - 오전 시간대 가동률 확인\n   - 금일 예약 현황 및 잔여 슬롯 파악\n\n3. 프로모션 점검\n   - 진행 중인 이벤트 실적 확인\n   - 마감 임박 프로모션 리마인드` },
      { title: "⚡ 즉시 실행 항목", type: "action", content: `□ 미방문 고객 상위 10명에게 안내 메시지 발송\n□ 오늘 예약 고객 확인 및 준비 사항 점검\n□ 프론트 직원에게 프로모션 안내 스크립트 전달\n□ 시설 점검 및 청결 상태 확인` },
      { title: "💡 추가 권장사항", type: "recommendation", content: `- 이번 주 내로 재등록 만료 대상자 접촉 계획 수립\n- 시즌 프로모션 효과 중간 점검 실시\n- 직원 교육 일정 확인` },
    ],
    "이번 주 추천 액션": [
      { title: "📊 이번 주 핵심 액션", type: "summary", content: `${biz} 운영 현황 기반으로 이번 주에 집중해야 할 핵심 액션을 정리했습니다.\n\n▶ 매출 강화\n- 비수요 시간대 활성화 프로모션 실행\n- 기존 고객 재구매/재등록 유도 캠페인\n\n▶ 운영 효율\n- 시간대별 가동률 분석 및 최적화\n- 인력 배치 조정 검토\n\n▶ 고객 관리\n- 미방문 고객 복귀 캠페인\n- VIP 고객 특별 관리 프로그램 점검` },
      { title: "📅 일자별 실행 계획", type: "detail", content: `월요일: 주간 목표 설정 및 팀 공유\n화요일: 프로모션 문구 준비 및 발송\n수요일: 중간 실적 점검\n목요일: 미방문 고객 접촉 캠페인 실행\n금요일: 주간 성과 정리 및 차주 계획 수립` },
      { title: "📈 기대 효과", type: "recommendation", content: `- 비수요 시간대 가동률 15~20% 개선 예상\n- 미방문 고객 복귀율 30% 이상 목표\n- 주간 매출 10% 증가 기대` },
      { title: "⚠️ 주의사항", type: "risk", content: `- 할인 프로모션은 기존 고객 불만 최소화 필요\n- 과도한 접촉은 역효과 가능 — 적정 빈도 유지\n- 인력 부족 시 우선순위 기반 선택 집중` },
    ],
    "놓치고 있는 운영 항목": [
      { title: "⚠️ 놓치고 있는 운영 항목", type: "summary", content: `${biz} 업종 기준으로 현재 놓치고 있을 가능성이 높은 운영 항목을 점검했습니다.\n\n1. 미방문 고객 관리 미흡\n   - 30일 이상 미방문 고객 접촉 이력 없음\n   - 자동 리마인드 시스템 미가동\n\n2. 프로모션 종료 후 후속 조치 부재\n   - 지난 달 프로모션 참여 고객 후속 연락 없음\n\n3. 시설 정기 점검 지연\n   - 월간 점검 일정 초과` },
      { title: "⚡ 즉시 조치 항목", type: "action", content: `□ 미방문 고객 상위 15명 접촉 시작\n□ 프로모션 후속 안내 문자 발송\n□ 시설 점검 일정 즉시 잡기\n□ 직원 교육 미실시 항목 확인` },
      { title: "💡 개선 권장사항", type: "recommendation", content: `- 월간 운영 체크리스트 도입으로 누락 방지\n- 자동 리마인드 설정 검토\n- 주간 운영 회의에서 점검 항목 공유` },
    ],
    "캠페인 추천": [
      { title: "📢 추천 캠페인", type: "summary", content: `${biz} 업종 현황 기반 추천 캠페인:\n\n▶ 캠페인 1: 비수요 시간대 활성화\n- 목적: 오전/평일 가동률 개선\n- 대상: 시간 여유 있는 고객군\n- 채널: 카카오톡 + 문자\n\n▶ 캠페인 2: 미방문 고객 복귀\n- 목적: 30일 이상 미방문 고객 재활성화\n- 혜택: 복귀 특별 할인\n- 채널: 문자 + 전화` },
      { title: "📋 실행 계획", type: "detail", content: `1주차: 대상 고객 리스트 확정 + 문구 작성\n2주차: 캠페인 발송 + 응답 모니터링\n3주차: 중간 성과 점검 + 조정\n4주차: 최종 성과 정리` },
      { title: "📈 기대 효과", type: "recommendation", content: `- 비수요 시간대 가동률 20% 개선\n- 미방문 고객 복귀율 25% 이상\n- 월 매출 10~15% 증가 기대` },
    ],
    "일정/마감 리마인드": [
      { title: "📅 주요 일정 및 마감 리마인드", type: "summary", content: `${biz} 운영 기준 확인이 필요한 일정:\n\n▶ 이번 주 마감\n- 프로모션 종료일: [날짜]\n- 계약 갱신 마감: [거래처명] — [날짜]\n- 직원 교육 이수 기한: [날짜]\n\n▶ 다음 주 예정\n- 정기 시설 점검: [날짜]\n- 월간 보고서 제출: [날짜]` },
      { title: "⏰ 긴급 확인 항목", type: "action", content: `□ 프로모션 종료 전 마지막 안내 발송\n□ 계약 갱신 의사 확인 연락\n□ 미이수 직원 교육 일정 재배정` },
      { title: "💡 리마인드 자동화 제안", type: "recommendation", content: `- 반복 일정은 리마인드 보드에 등록하여 자동 알림\n- 계약 갱신은 30일 전부터 단계별 알림 설정\n- 교육/점검은 월초 일괄 등록 권장` },
    ],
    "업종별 체크리스트": [
      { title: "✅ 일일 운영 체크리스트", type: "checklist", content: `${biz} 업종 기준 일일 점검 항목:\n\n□ 시설 점검\n   - 운영 시설 청결 상태 확인\n   - 장비/기자재 작동 점검\n   - 안전 시설 확인\n\n□ 고객 관리\n   - 오늘 예약/방문 고객 리스트 확인\n   - 특이사항 고객 별도 메모\n   - 문의/불만 응대 현황 점검\n\n□ 매출 관리\n   - 전일 매출 확인 및 목표 대비 점검\n   - 프로모션 실적 확인\n   - 결제 관련 이슈 점검` },
      { title: "📋 주간 점검 항목", type: "checklist", content: `□ 주간 매출/KPI 리뷰\n□ 직원 교육 및 피드백\n□ 재고/자재 현황 파악\n□ 고객 응대 품질 점검\n□ 경쟁사 동향 모니터링\n□ 마케팅 캠페인 성과 점검` },
      { title: "🔧 월간 관리 항목", type: "checklist", content: `□ 월간 실적 보고서 작성\n□ 장비 정기 점검\n□ 직원 평가 및 면담\n□ 고객 만족도 조사\n□ 가격 정책 검토\n□ 시즌 계획 수립/점검` },
    ],
    "응대 문안": [
      { title: "📞 전화 응대 스크립트", type: "detail", content: `[인사]\n안녕하세요, ${context.contextSummary.organizationName}입니다.\n무엇을 도와드릴까요?\n\n[문의 응대]\n네, 고객님. 확인해 드리겠습니다.\n잠시만 기다려 주시겠습니까?\n\n[안내]\n현재 저희 ${biz}에서는 [혜택/프로모션] 진행 중입니다.\n자세한 내용 안내해 드릴까요?\n\n[마무리]\n추가로 궁금하신 점 있으시면 언제든 연락 주세요.\n감사합니다. 좋은 하루 되세요!` },
      { title: "💬 문자/카카오톡 응대 문안", type: "detail", content: `[예약 확인]\n안녕하세요, ${context.contextSummary.organizationName}입니다.\n[날짜] [시간] 예약이 확인되었습니다.\n방문 시 문의사항 있으시면 연락 주세요.\n\n[재방문 유도]\n안녕하세요, 고객님!\n${context.contextSummary.organizationName}에서 특별 혜택을 준비했습니다.\n[혜택 내용]\n자세히 보기: [링크]\n\n[후속 안내]\n방문해 주셔서 감사합니다!\n다음 방문 시 [혜택]을 제공해 드립니다.` },
      { title: "🔄 상황별 응대 가이드", type: "action", content: `▶ 불만 접수 시\n1. 진심 어린 사과 먼저\n2. 구체적 상황 경청\n3. 해결 방안 제시\n4. 후속 조치 약속\n\n▶ 가격 문의 시\n1. 기본 요금 안내\n2. 현재 프로모션 소개\n3. 장기 이용 혜택 설명\n\n▶ 예약 변경/취소 시\n1. 변경 가능 여부 확인\n2. 대안 일정 제시\n3. 환불/크레딧 정책 안내` },
    ],
    "재등록 관리": [
      { title: "📊 재등록 대상 현황 분석", type: "summary", content: `${biz} 기준 재등록 관리 현황:\n\n▶ 만료 예정 고객: 47명\n   - 7일 내 만료: 12명\n   - 14일 내 만료: 18명\n   - 30일 내 만료: 17명\n\n▶ 재등록 예상률: 65%\n▶ 이탈 위험 고객: 16명\n\n이탈 위험 요인:\n- 방문 빈도 감소 (주 3회 → 주 1회)\n- 최근 불만 접수 이력\n- 경쟁사 프로모션 영향` },
      { title: "📝 재등록 유도 문안", type: "detail", content: `[조기 재등록 안내]\n안녕하세요, 고객님!\n현재 이용 중인 [상품명] 만료일이 [날짜]입니다.\n\n조기 재등록 시 특별 혜택을 드립니다:\n✅ 1개월 무료 연장\n✅ [추가 혜택]\n\n[만료 임박 안내]\n고객님의 [상품명]이 [N일] 후 만료됩니다.\n지금 재등록하시면 [혜택]을 받으실 수 있습니다.` },
      { title: "📅 접촉 일정 계획", type: "action", content: `1단계 (만료 30일 전): 감사 메시지 + 재등록 안내\n2단계 (만료 14일 전): 혜택 강조 리마인드\n3단계 (만료 7일 전): 긴급 안내 + 추가 혜택\n4단계 (만료 당일): 최종 안내\n5단계 (만료 후 7일): 복귀 유도 특별 제안` },
      { title: "💡 재등록률 개선 제안", type: "recommendation", content: `- 조기 재등록 인센티브 강화 (만기 2주 전 등록 시 추가 혜택)\n- 이탈 위험 고객 별도 관리 (1:1 상담 연결)\n- 재등록 시 업그레이드 옵션 제공\n- 장기 등록 할인 패키지 도입 검토` },
    ],
    "프로모션 기획": [
      { title: "🎯 프로모션 기획안 요약", type: "summary", content: `${biz} 맞춤 프로모션 기획:\n\n▶ 프로모션명: [시즌] 특별 프로모션\n▶ 기간: 2주간 (시작일 ~ 종료일)\n▶ 목표: 신규 고객 유치 + 기존 고객 활성화\n\n▶ 핵심 전략\n1. 체험/신규 고객 대상 할인\n2. 기존 고객 추천 인센티브\n3. SNS 공유 이벤트 연계` },
      { title: "📋 실행 계획", type: "detail", content: `1주차: 사전 홍보\n- 카카오톡 사전 안내 발송\n- SNS 티저 콘텐츠 게시\n- 매장 내 POP 설치\n\n2주차: 본 프로모션\n- 할인/혜택 적용 시작\n- 실시간 참여 현황 모니터링\n- 중간 성과 점검 및 조정\n\n3주차: 후속 관리\n- 참여 고객 후속 연락\n- 성과 분석 리포트 작성\n- 다음 프로모션 계획 반영` },
      { title: "💰 예산 및 기대효과", type: "detail", content: `▶ 예상 비용\n- 할인 비용: [금액]\n- 홍보물 제작: [금액]\n- 인건비 추가: [금액]\n\n▶ 기대 효과\n- 신규 고객: 30명 이상\n- 매출 증가: 15~20%\n- 브랜드 인지도 향상` },
      { title: "⚠️ 리스크 및 대응", type: "risk", content: `- 기존 정가 이용 고객 불만 → 기존 회원 추가 혜택 제공\n- 프로모션 종료 후 매출 급감 → 후속 프로그램 연계\n- 운영 인력 부족 → 파트타임 인력 사전 확보` },
    ],
    "디자인 요청": [
      { title: "🎨 디자인 요청 브리프", type: "summary", content: `${biz} 맞춤 디자인 브리프:\n\n▶ 제작물 유형: [배너/포스터/전단지]\n▶ 용도: [온라인/오프라인/겸용]\n▶ 크기: [규격]\n▶ 주요 메시지: [핵심 문구]\n▶ 톤앤매너: [밝고 활기찬 / 프리미엄 / 신뢰감]` },
      { title: "📝 문안 초안", type: "detail", content: `[메인 카피]\n${context.contextSummary.organizationName}\n[프로모션/이벤트명]\n\n[서브 카피]\n지금 바로 [혜택]을 확인하세요!\n\n[상세 정보]\n- 기간: [날짜]\n- 혜택: [내용]\n- 문의: [연락처]\n\n[CTA]\n지금 예약하세요 / 자세히 보기` },
      { title: "📐 레이아웃 가이드", type: "detail", content: `▶ 구성 요소 배치\n- 상단: 로고 + 이벤트명\n- 중앙: 핵심 혜택 강조\n- 하단: 기간/조건 + 연락처\n\n▶ 색상 가이드\n- 메인 컬러: 브랜드 컬러 기준\n- 강조 컬러: 시즌감 반영\n- 배경: 깔끔하고 가독성 확보\n\n▶ 참고사항\n- 모바일 최적화 고려\n- 핵심 정보 3초 내 인지 가능하도록` },
    ],
    "홍보물 문안 + 레이아웃": [
      { title: "📄 홍보물 문안", type: "detail", content: `[제목]\n${context.contextSummary.organizationName} [이벤트/프로모션명]\n\n[본문]\n${biz} 업종 특화 홍보 문안:\n\n특별 혜택을 준비했습니다!\n[혜택 1]: [상세]\n[혜택 2]: [상세]\n[혜택 3]: [상세]\n\n📅 기간: [시작] ~ [종료]\n📍 장소: ${context.contextSummary.location}\n📞 문의: [연락처]` },
      { title: "📐 레이아웃 구성안", type: "detail", content: `▶ A4 전단지 기준\n\n[상단 1/3]\n- 로고 (좌상단)\n- 메인 비주얼 이미지\n- 이벤트 타이틀 (대형 폰트)\n\n[중단 1/3]\n- 혜택 아이콘 + 설명 (3열 배치)\n- 핵심 수치/할인율 강조\n\n[하단 1/3]\n- 기간/조건 정보\n- 지도/약도\n- QR코드 + 연락처` },
      { title: "🎨 디자인 방향", type: "recommendation", content: `- 톤앤매너: 깔끔하고 신뢰감 있는 디자인\n- 시즌감: 현재 시즌에 맞는 색감 활용\n- 가독성: 핵심 정보 빠른 인지 가능\n- 브랜드 일관성: 기존 브랜드 가이드 반영` },
    ],
    "AI 진단실": [
      { title: "📊 핵심 문제 요약", type: "summary", content: `${biz} 업종 기준으로 현재 가장 시급한 운영 이슈를 분석했습니다.\n\n▶ 핵심 지표 현황\n${context.contextSummary.keyMetrics.map(m => `- ${m}`).join("\n")}\n\n▶ 주요 문제\n- 비수요 시간대 가동률 저조\n- 고객 이탈 방지 체계 미흡\n- 운영 프로세스 표준화 필요\n\n▶ 영향 범위\n- 전체 매출의 약 15~20% 손실 추정\n- 고객 만족도 하락 위험` },
      { title: "🔍 예상 원인 분석", type: "detail", content: `1. 타겟 고객 분석 부재\n   - 시간대별/요일별 이용 패턴 미파악\n   - 고객 세그먼트별 맞춤 전략 부재\n\n2. 가격 정책의 경직성\n   - 시간대/시즌별 차등 요금 미적용\n   - 비수요 시간 인센티브 부족\n\n3. 프로그램 다양성 부족\n   - 특정 고객층 대상 프로그램 미운영\n   - 커뮤니티/이벤트 프로그램 부재\n\n4. 홍보 채널 한계\n   - 디지털 마케팅 활성화 부족\n   - 오프라인 홍보 미흡` },
      { title: "⭐ 우선순위 설정", type: "action", content: `[긴급] 즉시 실행\n- 비수요 시간대 할인 프로모션 기획\n- 미방문/이탈 위험 고객 접촉\n\n[높음] 1주 내 실행\n- 타겟 고객층 맞춤 프로그램 개발\n- 주변 지역 홍보 강화\n\n[중간] 1개월 내 실행\n- 시간대별 차등 요금 체계 도입 검토\n- 고객 관리 시스템 프로세스 정비` },
      { title: "📅 이번 주 실행 계획", type: "detail", content: `월요일: 현황 데이터 정리 및 팀 공유\n화요일: 프로모션 문구 작성 (마케팅 카피 생성기 활용)\n수요일: 프로모션 발송 및 고객 접촉 시작\n목요일: 맞춤 프로그램 초안 작성\n금요일: 주간 성과 정리 및 차주 계획` },
      { title: "📆 이번 달 실행 계획", type: "detail", content: `1주차: 긴급 대응\n- 할인 프로모션 실행\n- 이탈 위험 고객 접촉\n\n2주차: 프로그램 개발\n- 신규 프로그램 출시\n- 제휴/파트너십 검토\n\n3주차: 마케팅 강화\n- 온오프라인 홍보 확대\n- SNS/리뷰 캠페인 실행\n\n4주차: 성과 분석\n- 월간 KPI 리뷰\n- 전략 조정 및 다음 달 계획` },
      { title: "⚠️ 예상 리스크", type: "risk", content: `1. 기존 정가 이용 고객 불만\n   - 대응: 기존 고객 추가 혜택 제공\n   - 커뮤니케이션: "감사 프로모션"으로 포지셔닝\n\n2. 할인에 따른 수익성 저하\n   - 대응: 기간/대상 명확히 제한\n   - 모니터링: 주간 손익 분석\n\n3. 운영 인력 부담 증가\n   - 대응: 우선순위 기반 선택 집중\n   - 프로세스 자동화 검토` },
      { title: "➡️ 권장 다음 단계", type: "recommendation", content: `1. 마케팅 카피 생성기에서 프로모션 문구 작성\n2. 응대 문안 생성기에서 고객 접촉 스크립트 준비\n3. 내부 서식 초안에서 실행 계획 문서화\n4. 2주 후 재진단 실시하여 효과 측정` },
    ],
    "마케팅 카피 생성기": [
      { title: "📱 문자 메시지 (SMS)", type: "detail", content: `[${context.contextSummary.organizationName}] 특별 혜택 안내!\n\n지금 바로 확인하세요.\n기간 한정 특별 프로모션 진행 중\n\n예약/문의: [연락처]\n\n수신거부 080-XXX-XXXX` },
      { title: "💬 카카오톡 알림톡", type: "detail", content: `🏌️ ${context.contextSummary.organizationName}에서 특별 혜택을 준비했습니다!\n\n✅ [혜택 1]\n✅ [혜택 2]\n✅ [혜택 3]\n\n📅 이벤트 기간: [시작일] ~ [종료일]\n⏰ 선착순 한정\n\n📞 예약: [연락처]\n\n▶ 지금 바로 예약하세요!` },
      { title: "📢 이벤트 소개 문구", type: "detail", content: `${biz}의 새로운 경험을 만나보세요.\n\n${context.contextSummary.organizationName}에서 준비한 특별 프로모션으로\n더 나은 서비스를 경험하실 수 있습니다.\n\n지금이 바로 그 기회입니다.` },
      { title: "📋 프로모션 공지문", type: "detail", content: `【공지】특별 프로모션 안내\n\n안녕하세요, ${context.contextSummary.organizationName}입니다.\n\n감사의 마음을 담아 특별 프로모션을 진행합니다.\n\n▶ 혜택 내용\n1. [혜택 1]\n2. [혜택 2]\n3. [혜택 3]\n\n▶ 기간: [시작] ~ [종료]\n▶ 참여 방법: [안내]\n▶ 유의사항: 타 할인과 중복 적용 불가\n\n많은 참여 부탁드립니다.\n${context.contextSummary.organizationName} 드림` },
      { title: "💼 세일즈 설명 문구", type: "detail", content: `왜 지금인가요?\n\n▶ 최적의 환경\n- 쾌적하고 여유로운 이용 환경\n- 전문 서비스 제공\n\n▶ 합리적인 비용\n- 특별 할인 적용\n- 추가 혜택 포함\n\n이 기회를 놓치지 마세요.` },
    ],
    "내부 서식 초안": [
      { title: "📄 서식 초안", type: "detail", content: `[문서 제목]\n${context.contextSummary.organizationName} [서식명]\n\n작성일: ${new Date().toISOString().split("T")[0]}\n작성자: [담당자명]\n부서: [부서명]\n\n[본문 영역]\n1. 목적\n   - [문서 목적 기재]\n\n2. 주요 내용\n   - [항목 1]\n   - [항목 2]\n   - [항목 3]\n\n3. 특이사항\n   - [기재 사항]\n\n4. 첨부\n   - [첨부 파일 목록]` },
      { title: "📋 활용 가이드", type: "action", content: `▶ 이 서식의 활용 방법:\n1. [ ] 안의 내용을 실제 데이터로 교체\n2. 불필요한 항목 삭제 또는 추가\n3. 부서/담당자 정보 기입\n4. 승인 후 발송 또는 보관\n\n▶ 관련 서식:\n- 업무 지시서\n- 회의록\n- 보고서 양식` },
    ],
    "계약/발주/구매 정리": [
      { title: "📋 계약/발주 정리 요약", type: "summary", content: `${biz} 기준 계약·발주 관리 현황 정리:\n\n▶ 활성 계약: [N]건\n▶ 이번 달 발주 예정: [N]건\n▶ 정산 대기: [N]건\n\n주요 거래처/협력사:\n1. [업체명] — [계약 내용] — 갱신일: [날짜]\n2. [업체명] — [계약 내용] — 갱신일: [날짜]\n3. [업체명] — [계약 내용] — 갱신일: [날짜]` },
      { title: "📝 발주서 초안", type: "detail", content: `[발주서]\n\n발주처: ${context.contextSummary.organizationName}\n수신: [거래처명]\n발주일: ${new Date().toISOString().split("T")[0]}\n\n▶ 발주 내역\n| 품목 | 수량 | 단가 | 금액 |\n|------|------|------|------|\n| [품목1] | [수량] | [단가] | [금액] |\n| [품목2] | [수량] | [단가] | [금액] |\n\n▶ 합계: [총액]\n▶ 납기일: [날짜]\n▶ 비고: [특이사항]` },
      { title: "⚠️ 계약 리마인드", type: "risk", content: `- 갱신 예정 계약 확인 필요\n- 가격 재협상 대상 검토\n- 신규 거래처 비교 견적 요청 검토` },
    ],
  };

  return sectionLibrary[subtool] || [
    { title: `📊 ${subtool} 결과`, type: "summary" as const, content: `${biz} 업종 기준으로 ${subtool} 분석을 완료했습니다.\n\n주요 내용이 여기에 표시됩니다.\n실제 AI 엔진 연동 시 업종별 맞춤 분석 결과가 생성됩니다.` },
    { title: "💡 추천 액션", type: "recommendation" as const, content: `1. [추천 액션 1]\n2. [추천 액션 2]\n3. [추천 액션 3]` },
  ];
}

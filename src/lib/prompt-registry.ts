/**
 * Prompt Registry Structure
 * 
 * INTERNAL ONLY — Operator-facing prompt management structure.
 * Customers never see or edit prompts directly.
 */

export type PromptStatus = "active" | "inactive" | "testing" | "deprecated";

export interface PromptEntry {
  id: string;
  module: string;
  subtool: string;
  businessTypes: string[];
  version: string;
  status: PromptStatus;
  lastTested: string | null;
  outputStyle: string;
  forbiddenRulesProfile: string;
  knowledgeScopeLink: string;
  engineRouteLink: string;
  description: string;
}

// Mock prompt registry entries for operator UI display
export const promptRegistry: PromptEntry[] = [
  // AI 비서
  { id: "p-001", module: "AI 비서", subtool: "오늘의 할 일", businessTypes: ["전체"], version: "v1.2", status: "active", lastTested: "2026-03-08", outputStyle: "체크리스트형", forbiddenRulesProfile: "기본 금지 규칙", knowledgeScopeLink: "업종별 운영 가이드", engineRouteLink: "일반 추천 엔진", description: "일일 할 일 추천 프롬프트" },
  { id: "p-002", module: "AI 비서", subtool: "이번 주 추천 액션", businessTypes: ["전체"], version: "v1.1", status: "active", lastTested: "2026-03-07", outputStyle: "구조화 요약형", forbiddenRulesProfile: "기본 금지 규칙", knowledgeScopeLink: "업종별 운영 가이드", engineRouteLink: "일반 추천 엔진", description: "주간 추천 액션 생성 프롬프트" },
  { id: "p-003", module: "AI 비서", subtool: "업종별 체크리스트", businessTypes: ["전체"], version: "v1.0", status: "active", lastTested: "2026-03-05", outputStyle: "체크리스트형", forbiddenRulesProfile: "기본 금지 규칙", knowledgeScopeLink: "업종별 운영 가이드", engineRouteLink: "일반 추천 엔진", description: "업종별 체크리스트 생성 프롬프트" },
  // AI 운영팀
  { id: "p-010", module: "AI 운영팀", subtool: "AI 진단실", businessTypes: ["전체"], version: "v2.1", status: "active", lastTested: "2026-03-09", outputStyle: "구조화 분석형", forbiddenRulesProfile: "운영 분석 금지 규칙", knowledgeScopeLink: "운영 분석 레퍼런스", engineRouteLink: "운영 분석 엔진", description: "비즈니스 진단 프롬프트" },
  // AI 영업팀
  { id: "p-020", module: "AI 영업팀", subtool: "응대 문안", businessTypes: ["전체"], version: "v1.3", status: "active", lastTested: "2026-03-06", outputStyle: "스크립트형", forbiddenRulesProfile: "영업 문안 금지 규칙", knowledgeScopeLink: "고객 응대 가이드", engineRouteLink: "영업 제안 엔진", description: "고객 응대 문안 생성 프롬프트" },
  { id: "p-021", module: "AI 영업팀", subtool: "재등록 관리", businessTypes: ["indoor", "academy", "fitting"], version: "v1.1", status: "active", lastTested: "2026-03-06", outputStyle: "제안서형", forbiddenRulesProfile: "영업 문안 금지 규칙", knowledgeScopeLink: "회원 관리 가이드", engineRouteLink: "영업 제안 엔진", description: "재등록 관리 분석 및 문안 프롬프트" },
  // AI 마케팅팀
  { id: "p-030", module: "AI 마케팅팀", subtool: "마케팅 카피 생성기", businessTypes: ["전체"], version: "v2.3", status: "active", lastTested: "2026-03-09", outputStyle: "채널별 카피형", forbiddenRulesProfile: "마케팅 금지 규칙", knowledgeScopeLink: "마케팅 레퍼런스", engineRouteLink: "캠페인/카피 엔진", description: "마케팅 카피 생성 프롬프트" },
  { id: "p-031", module: "AI 마케팅팀", subtool: "프로모션 기획", businessTypes: ["전체"], version: "v1.0", status: "testing", lastTested: "2026-03-08", outputStyle: "기획안형", forbiddenRulesProfile: "마케팅 금지 규칙", knowledgeScopeLink: "프로모션 레퍼런스", engineRouteLink: "캠페인/카피 엔진", description: "프로모션 기획 프롬프트" },
  // AI 디자인팀
  { id: "p-040", module: "AI 디자인팀", subtool: "디자인 요청", businessTypes: ["전체"], version: "v1.0", status: "testing", lastTested: "2026-03-07", outputStyle: "브리프형", forbiddenRulesProfile: "디자인 금지 규칙", knowledgeScopeLink: "브랜드 가이드", engineRouteLink: "디자인 브리프 엔진", description: "디자인 요청 브리프 프롬프트" },
  { id: "p-041", module: "AI 디자인팀", subtool: "홍보물 문안 + 레이아웃", businessTypes: ["전체"], version: "v1.0", status: "testing", lastTested: "2026-03-07", outputStyle: "문안+레이아웃형", forbiddenRulesProfile: "디자인 금지 규칙", knowledgeScopeLink: "브랜드 가이드", engineRouteLink: "디자인 브리프 엔진", description: "홍보물 문안 및 레이아웃 프롬프트" },
  // AI 경영지원
  { id: "p-050", module: "AI 경영지원", subtool: "내부 서식 초안", businessTypes: ["전체"], version: "v1.0", status: "active", lastTested: "2026-03-05", outputStyle: "서식형", forbiddenRulesProfile: "문서 금지 규칙", knowledgeScopeLink: "서식 레퍼런스", engineRouteLink: "문서 초안 엔진", description: "내부 서식 초안 프롬프트" },
  { id: "p-051", module: "AI 경영지원", subtool: "계약/발주/구매 정리", businessTypes: ["전체"], version: "v1.0", status: "active", lastTested: "2026-03-04", outputStyle: "정리형", forbiddenRulesProfile: "문서 금지 규칙", knowledgeScopeLink: "계약 레퍼런스", engineRouteLink: "문서 초안 엔진", description: "계약/발주 정리 프롬프트" },
  // 시장조사
  { id: "p-060", module: "시장조사", subtool: "조사 요약", businessTypes: ["전체"], version: "v1.2", status: "active", lastTested: "2026-03-08", outputStyle: "보고서형", forbiddenRulesProfile: "리서치 금지 규칙", knowledgeScopeLink: "시장조사 레퍼런스", engineRouteLink: "리서치 요약 엔진", description: "시장조사 요약 프롬프트" },
];

export const forbiddenRulesProfiles: Record<string, string[]> = {
  "기본 금지 규칙": [
    "경쟁사 비방 금지", "가격 허위 표기 금지", "과장 광고 표현 금지",
    "개인정보 노출 금지", "비속어/불쾌 표현 금지",
  ],
  "운영 분석 금지 규칙": [
    "확정적 예측 금지", "재무 보증 표현 금지", "법률 자문 표현 금지",
    "인사 평가 표현 금지",
  ],
  "영업 문안 금지 규칙": [
    "강압적 판매 표현 금지", "허위 할인 표현 금지", "경쟁사 비교 비방 금지",
    "'저렴한', '싸게' 등 저가 이미지 표현 금지",
  ],
  "마케팅 금지 규칙": [
    "허위/과장 광고 금지", "법적 근거 없는 효능 표현 금지",
    "타 브랜드 비하 금지", "성차별/연령차별 표현 금지",
  ],
  "디자인 금지 규칙": [
    "저작권 침해 소지 표현 금지", "타 브랜드 로고 무단 사용 금지",
    "불쾌한 이미지 표현 금지",
  ],
  "문서 금지 규칙": [
    "법률 자문 표현 금지", "재무 보증 표현 금지",
    "인사 평가 표현 금지", "확정적 계약 조건 표현 금지",
  ],
  "리서치 금지 규칙": [
    "확정적 시장 예측 금지", "투자 조언 표현 금지",
    "경쟁사 내부 정보 추측 금지",
  ],
};

export const knowledgeScopes: Record<string, { description: string; sources: string[] }> = {
  "업종별 운영 가이드": { description: "6개 업종별 운영 가이드 문서", sources: ["골프연습장 운영 매뉴얼", "골프장 운영 매뉴얼", "아카데미 운영 매뉴얼", "골프샵 운영 매뉴얼", "피팅샵 운영 매뉴얼", "골프회사 운영 매뉴얼"] },
  "운영 분석 레퍼런스": { description: "운영 지표 분석 참조 자료", sources: ["KPI 벤치마크 데이터", "업종별 표준 운영 지표", "시즌별 운영 가이드"] },
  "고객 응대 가이드": { description: "고객 응대 표준 가이드", sources: ["전화 응대 매뉴얼", "온라인 응대 매뉴얼", "불만 처리 가이드"] },
  "회원 관리 가이드": { description: "회원 관리 및 유지 가이드", sources: ["재등록 관리 매뉴얼", "이탈 방지 가이드", "VIP 관리 매뉴얼"] },
  "마케팅 레퍼런스": { description: "마케팅 캠페인 참조 자료", sources: ["성공 캠페인 사례집", "채널별 가이드", "시즌 마케팅 플레이북"] },
  "프로모션 레퍼런스": { description: "프로모션 기획 참조", sources: ["프로모션 기획 템플릿", "ROI 측정 가이드", "경쟁사 프로모션 분석"] },
  "브랜드 가이드": { description: "브랜드 디자인 가이드", sources: ["OkeyGolf 브랜드 매뉴얼", "디자인 시스템 가이드", "홍보물 제작 가이드"] },
  "서식 레퍼런스": { description: "내부 서식 템플릿", sources: ["업무 지시서 템플릿", "보고서 양식", "회의록 양식"] },
  "계약 레퍼런스": { description: "계약/발주 관련 참조", sources: ["표준 계약서 양식", "발주서 양식", "정산 양식"] },
  "시장조사 레퍼런스": { description: "시장조사 방법론", sources: ["데스크 리서치 가이드", "경쟁 분석 프레임워크", "인사이트 도출 가이드"] },
};

/**
 * ROS (Result Orchestration System) Routing Configuration
 * 
 * INTERNAL ONLY — Not exposed to customer-facing UI.
 * Maps modules/subtools to engine families, output styles, and escalation conditions.
 */

export type EngineFamily = 
  | "general-recommendation"
  | "operations-analysis"
  | "sales-proposal"
  | "campaign-copy"
  | "design-brief"
  | "document-draft"
  | "research-summary";

export type RiskLevel = "low" | "medium" | "high";

export interface ROSRoute {
  module: string;
  engineFamily: EngineFamily;
  engineLabel: string;
  outputStyle: string;
  riskLevel: RiskLevel;
  consultantEscalationCondition: string;
  businessTypeOverrides?: Partial<Record<string, { engineNote: string }>>;
}

export const rosRoutes: Record<string, ROSRoute> = {
  "AI 비서": {
    module: "AI 비서",
    engineFamily: "general-recommendation",
    engineLabel: "일반 추천 엔진",
    outputStyle: "체크리스트 / 요약형",
    riskLevel: "low",
    consultantEscalationCondition: "반복 미실행 항목 3회 이상 감지 시",
    businessTypeOverrides: {
      indoor: { engineNote: "타석·회원 운영 데이터 우선 참조" },
      course: { engineNote: "티타임·패키지 데이터 우선 참조" },
    },
  },
  "AI 운영팀": {
    module: "AI 운영팀",
    engineFamily: "operations-analysis",
    engineLabel: "운영 분석 엔진",
    outputStyle: "구조화 분석형",
    riskLevel: "medium",
    consultantEscalationCondition: "KPI 3개월 연속 하락 또는 긴급 이슈 감지 시",
  },
  "AI 영업팀": {
    module: "AI 영업팀",
    engineFamily: "sales-proposal",
    engineLabel: "영업 제안 엔진",
    outputStyle: "제안서 / 스크립트형",
    riskLevel: "medium",
    consultantEscalationCondition: "전환율 목표 미달 2개월 연속 시",
  },
  "AI 마케팅팀": {
    module: "AI 마케팅팀",
    engineFamily: "campaign-copy",
    engineLabel: "캠페인/카피 엔진",
    outputStyle: "채널별 카피형",
    riskLevel: "low",
    consultantEscalationCondition: "캠페인 ROI 기준 미달 시",
  },
  "AI 디자인팀": {
    module: "AI 디자인팀",
    engineFamily: "design-brief",
    engineLabel: "디자인 브리프 엔진",
    outputStyle: "브리프 + 레이아웃형",
    riskLevel: "low",
    consultantEscalationCondition: "고품질 제작 필요 시 (전문 디자이너 전환)",
  },
  "AI 경영지원": {
    module: "AI 경영지원",
    engineFamily: "document-draft",
    engineLabel: "문서 초안 엔진",
    outputStyle: "서식/문서형",
    riskLevel: "medium",
    consultantEscalationCondition: "계약/법률 관련 검토 필요 시",
  },
  "시장조사": {
    module: "시장조사",
    engineFamily: "research-summary",
    engineLabel: "리서치 요약 엔진",
    outputStyle: "조사 보고서형",
    riskLevel: "low",
    consultantEscalationCondition: "심층 분석 또는 현장 조사 필요 시",
  },
};

export function getROSRoute(module: string): ROSRoute | undefined {
  return rosRoutes[module];
}

export function getEngineLabel(module: string): string {
  return rosRoutes[module]?.engineLabel || "기본 엔진";
}

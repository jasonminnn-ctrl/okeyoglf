/**
 * KPI 차트 시각화 — 운영자 KPI 보드용
 * 상태 분포 도넛 + 카테고리별 달성률 바 차트
 */

import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiChartItem {
  name: string;
  category: string;
  targetValue: number;
  currentValue: number;
  status: string;
  orgName: string;
  industry: string;
}

interface KpiChartsProps {
  data: KpiChartItem[];
}

const STATUS_COLORS: Record<string, string> = {
  achieved: "hsl(210, 70%, 55%)",
  on_track: "hsl(150, 60%, 45%)",
  at_risk: "hsl(40, 85%, 55%)",
  behind: "hsl(0, 70%, 55%)",
};

const STATUS_LABELS: Record<string, string> = {
  achieved: "달성",
  on_track: "정상",
  at_risk: "주의",
  behind: "미달",
};

export default function KpiCharts({ data }: KpiChartsProps) {
  // Status distribution for donut
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { achieved: 0, on_track: 0, at_risk: 0, behind: 0 };
    data.forEach(k => { counts[k.status] = (counts[k.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: STATUS_LABELS[key] || key, value, color: STATUS_COLORS[key] || "hsl(var(--muted))" }));
  }, [data]);

  // Category achievement rates for bar chart
  const categoryData = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    data.forEach(k => {
      if (!groups[k.category]) groups[k.category] = { sum: 0, count: 0 };
      groups[k.category].sum += Math.min(100, (k.currentValue / k.targetValue) * 100);
      groups[k.category].count += 1;
    });
    return Object.entries(groups).map(([cat, { sum, count }]) => ({
      category: cat,
      달성률: Math.round(sum / count),
    }));
  }, [data]);

  // Industry breakdown for bar chart
  const industryData = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    data.forEach(k => {
      if (!groups[k.industry]) groups[k.industry] = { sum: 0, count: 0 };
      groups[k.industry].sum += Math.min(100, (k.currentValue / k.targetValue) * 100);
      groups[k.industry].count += 1;
    });
    return Object.entries(groups).map(([ind, { sum, count }]) => ({
      업종: ind,
      달성률: Math.round(sum / count),
      건수: count,
    }));
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Status distribution donut */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">상태 분포</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value}건`, name]} />
              <Legend
                formatter={(value) => <span className="text-[10px]">{value}</span>}
                wrapperStyle={{ fontSize: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category achievement bar */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">카테고리별 평균 달성률</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={50} />
              <Tooltip formatter={(value: number) => [`${value}%`, "달성률"]} />
              <Bar dataKey="달성률" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Industry breakdown */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">업종별 평균 달성률</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={industryData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="업종" tick={{ fontSize: 9 }} width={70} />
              <Tooltip formatter={(value: number, name: string) => [name === "건수" ? `${value}건` : `${value}%`, name]} />
              <Bar dataKey="달성률" fill="hsl(150, 60%, 45%)" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

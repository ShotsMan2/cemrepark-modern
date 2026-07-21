"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ComposedChart = dynamic(() => import("recharts").then((mod) => mod.ComposedChart), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const RechartsTooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const ReferenceLine = dynamic(() => import("recharts").then((mod) => mod.ReferenceLine), { ssr: false });
const ReferenceArea = dynamic(() => import("recharts").then((mod) => mod.ReferenceArea), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });

export interface RevenueData {
  name: string;
  gerceklesen: number;
  hedef: number;
  oncekiDonem?: number;
}
interface RevenueChartProps {
  data: RevenueData[];
  showComparison?: boolean;
  targetValue?: number;
}

export default function RevenueChart({ data, showComparison = false, targetValue }: RevenueChartProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, [data]);
  return (
    <div className="w-full h-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickFormatter={(val) => `₺${val / 1000}k`} />
          <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} itemStyle={{ color: "#fff", fontWeight: "bold" }} formatter={(value: any) => value ? `₺${Number(value).toLocaleString()}` : "₺0"} />
          {targetValue && <ReferenceLine y={targetValue} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} label={{ value: "Hedef", fill: "#f59e0b", fontSize: 10, position: "right" }} />}
          {showComparison && <Bar dataKey="oncekiDonem" fill="#6b7280" radius={[4, 4, 0, 0]} barSize={20} opacity={0.5} />}
          <Bar dataKey="gerceklesen" fill="#ff007f" radius={[4, 4, 0, 0]} barSize={showComparison ? 20 : 40} isAnimationActive={animated} animationDuration={800} />
          <Line type="monotone" dataKey="hedef" stroke="#ffd700" strokeWidth={3} dot={{ r: 6, fill: "#ffd700", strokeWidth: 2, stroke: "#000" }} activeDot={{ r: 8 }} isAnimationActive={animated} animationDuration={1000} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

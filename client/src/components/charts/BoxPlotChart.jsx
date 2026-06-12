import React from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ErrorBar,
  Scatter,
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-2xl border border-white/10">
      <p className="text-xs font-medium text-gray-400 mb-2">{d?.name}</p>
      <div className="space-y-1 text-xs">
        <p className="text-white">Min: <span className="font-semibold">{d?.min?.toFixed(2)}</span></p>
        <p className="text-white">Q1: <span className="font-semibold">{d?.q1?.toFixed(2)}</span></p>
        <p className="text-brand-400">Median: <span className="font-semibold">{d?.median?.toFixed(2)}</span></p>
        <p className="text-white">Q3: <span className="font-semibold">{d?.q3?.toFixed(2)}</span></p>
        <p className="text-white">Max: <span className="font-semibold">{d?.max?.toFixed(2)}</span></p>
      </div>
    </div>
  )
}

export default function BoxPlotChart({ data = [], column = '', title = '' }) {
  // Transform data into box plot format
  // Each item should have: name, min, q1, median, q3, max
  const chartData = Array.isArray(data)
    ? data.map((item, idx) => ({
        name: item.name || item.column || `Column ${idx + 1}`,
        min: item.min || 0,
        q1: item.q1 || item.percentile_25 || 0,
        median: item.median || item.percentile_50 || 0,
        q3: item.q3 || item.percentile_75 || 0,
        max: item.max || 0,
        // For the bar: bottom of bar = q1, height = q3 - q1 (IQR)
        boxBottom: item.q1 || item.percentile_25 || 0,
        boxHeight: (item.q3 || item.percentile_75 || 0) - (item.q1 || item.percentile_25 || 0),
        // Whiskers as error bars
        lowerWhisker: (item.q1 || item.percentile_25 || 0) - (item.min || 0),
        upperWhisker: (item.max || 0) - (item.q3 || item.percentile_75 || 0),
      }))
    : []

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">{title || `Box Plot: ${column}`}</h3>
        <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title || `Box Plot: ${column}`}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* IQR Box */}
          <Bar dataKey="boxHeight" stackId="box" fill="url(#boxGrad)" radius={[4, 4, 4, 4]} maxBarSize={40}>
            {chartData.map((_, idx) => (
              <Cell key={idx} />
            ))}
          </Bar>
          {/* Median marker */}
          <Scatter dataKey="median" fill="#c084fc" shape="diamond" legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

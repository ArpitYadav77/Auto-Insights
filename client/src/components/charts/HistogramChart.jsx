import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-2xl border border-white/10">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold text-white">
          {p.name}: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function HistogramChart({ data = [], column = 'value', title = 'Distribution' }) {
  const chartData = Array.isArray(data)
    ? data.map((item, idx) => ({
        bin: item.bin || item.range || item.label || `Bin ${idx + 1}`,
        count: item.count || item.frequency || item.value || 0,
      }))
    : []

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title || `Distribution: ${column}`}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id={`histGrad-${column}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B2B" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#FFAE00" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="bin"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="count"
            fill={`url(#histGrad-${column})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
            name="Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

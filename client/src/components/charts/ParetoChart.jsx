import React from 'react'
import {
  ComposedChart,
  Bar,
  Line,
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
      <p className="text-xs font-medium text-gray-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {p.name === 'Cumulative %' ? `${Number(p.value).toFixed(1)}%` : Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function ParetoChart({
  data = [],
  categoryKey = 'category',
  valueKey = 'value',
  title = 'Pareto Analysis',
}) {
  // Calculate cumulative percentage
  const sorted = [...(Array.isArray(data) ? data : [])].sort(
    (a, b) => (b[valueKey] || b.count || 0) - (a[valueKey] || a.count || 0)
  )

  const total = sorted.reduce((sum, item) => sum + (item[valueKey] || item.count || 0), 0)
  let cumulative = 0

  const chartData = sorted.map((item) => {
    const val = item[valueKey] || item.count || 0
    cumulative += val
    return {
      category: item[categoryKey] || item.name || item.label || '',
      value: val,
      cumulative: total > 0 ? (cumulative / total) * 100 : 0,
    }
  })

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="paretoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="value"
            fill="url(#paretoGrad)"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
            name="Count"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#f59e0b', stroke: '#0f0f23', strokeWidth: 2 }}
            name="Cumulative %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

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

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-2xl border border-white/10">
      <p className="text-xs font-medium text-gray-400 mb-1">{d.payload?.category || d.payload?.name}</p>
      <p className="text-sm font-semibold text-white">
        {d.name}: {Number(d.value).toLocaleString()}
      </p>
    </div>
  )
}

export default function CategoryChart({
  data = [],
  categoryKey = 'category',
  valueKey = 'value',
  title = 'Categories',
  height = 280,
}) {
  const chartData = Array.isArray(data)
    ? data.map((item) => ({
        category: item[categoryKey] || item.name || item.label || '',
        value: item[valueKey] || item.count || 0,
      }))
    : []

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="catGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="value"
            fill="url(#catGrad)"
            radius={[0, 6, 6, 0]}
            maxBarSize={28}
            name="Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

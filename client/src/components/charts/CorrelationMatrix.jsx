import React from 'react'
import { motion } from 'framer-motion'

function getColor(value) {
  // value from -1 to 1 (correlation coefficient)
  const v = Math.max(-1, Math.min(1, value))
  if (v >= 0.7) return 'bg-brand-500'
  if (v >= 0.4) return 'bg-brand-500/70'
  if (v >= 0.1) return 'bg-brand-500/40'
  if (v > -0.1) return 'bg-white/10'
  if (v > -0.4) return 'bg-rose-500/40'
  if (v > -0.7) return 'bg-rose-500/70'
  return 'bg-rose-500'
}

function getTextColor(value) {
  const v = Math.abs(value)
  if (v >= 0.4) return 'text-white'
  return 'text-gray-400'
}

export default function CorrelationMatrix({ data = [], columns = [], title = 'Correlation Matrix' }) {
  // data can be:
  // 1. A 2D array: [[1, 0.5], [0.5, 1]]
  // 2. An object: { col1: { col1: 1, col2: 0.5 }, col2: { col1: 0.5, col2: 1 } }
  // 3. An array of objects: [{ column1: 'A', column2: 'B', correlation: 0.5 }]

  let matrix = []
  let labels = columns

  if (Array.isArray(data) && data.length > 0) {
    if (Array.isArray(data[0])) {
      // 2D array
      matrix = data
      if (!labels.length) {
        labels = data.map((_, i) => `Col ${i + 1}`)
      }
    } else if (data[0]?.column1 !== undefined) {
      // Array of {column1, column2, correlation} objects
      const uniqueCols = [...new Set(data.flatMap(d => [d.column1, d.column2]))]
      labels = uniqueCols
      matrix = uniqueCols.map(row =>
        uniqueCols.map(col => {
          if (row === col) return 1
          const found = data.find(
            d => (d.column1 === row && d.column2 === col) ||
                 (d.column1 === col && d.column2 === row)
          )
          return found?.correlation || found?.value || 0
        })
      )
    }
  } else if (typeof data === 'object' && !Array.isArray(data)) {
    // Object format
    labels = Object.keys(data)
    matrix = labels.map(row => labels.map(col => data[row]?.[col] || 0))
  }

  if (labels.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
        <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">
          No correlation data available
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex">
            <div className="w-20 h-8 flex-shrink-0" />
            {labels.map((label, i) => (
              <div
                key={i}
                className="w-14 h-8 flex-shrink-0 flex items-center justify-center"
              >
                <span
                  className="text-[10px] text-gray-500 font-medium truncate transform -rotate-45 origin-center"
                  title={label}
                >
                  {label.length > 6 ? label.slice(0, 6) + '…' : label}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix Grid */}
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              <div className="w-20 h-12 flex-shrink-0 flex items-center pr-2">
                <span className="text-[10px] text-gray-400 font-medium truncate" title={labels[rowIdx]}>
                  {labels[rowIdx]?.length > 10 ? labels[rowIdx].slice(0, 10) + '…' : labels[rowIdx]}
                </span>
              </div>
              {row.map((value, colIdx) => (
                <motion.div
                  key={colIdx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIdx * labels.length + colIdx) * 0.01 }}
                  className={`w-14 h-12 flex-shrink-0 flex items-center justify-center rounded-lg m-0.5 cursor-default transition-transform hover:scale-110 ${getColor(value)}`}
                  title={`${labels[rowIdx]} × ${labels[colIdx]}: ${value?.toFixed(3)}`}
                >
                  <span className={`text-[10px] font-semibold ${getTextColor(value)}`}>
                    {typeof value === 'number' ? value.toFixed(2) : '-'}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span className="text-[10px] text-gray-500">-1.0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white/10" />
          <span className="text-[10px] text-gray-500">0.0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-500" />
          <span className="text-[10px] text-gray-500">+1.0</span>
        </div>
      </div>
    </div>
  )
}
